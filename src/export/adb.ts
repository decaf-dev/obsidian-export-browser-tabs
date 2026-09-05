import { accessSync, constants, existsSync } from "fs";
import { isAbsolute } from "path";
import {
	ADB_DEVICES_TIMEOUT_MS,
	ADB_FORWARD_REMOVE_TIMEOUT_MS,
	ADB_FORWARD_TIMEOUT_MS,
	ADB_SHELL_TIMEOUT_MS,
	FALLBACK_DEVTOOLS_SOCKET,
} from "src/constants";
import { CommandResult, firstLine, runCommand } from "src/utils/exec-utils";
import { RemoteExportError } from "./errors";

export interface AndroidDevice {
	serial: string;
	state: string;
}

/**
 * Validates the configured ADB path without spawning anything.
 * Obsidian launched from Finder does not inherit the login shell's PATH, which is
 * why an absolute path is required here at all.
 * @throws RemoteExportError if the path is unset, relative, missing or not executable
 * @param adbPath - The absolute path to the ADB executable
 */
export const validateAdbPath = (adbPath: string): void => {
	if (adbPath === "") {
		throw new RemoteExportError(
			"MISSING_ADB_PATH",
			"No ADB path specified. Please set one in the plugin settings."
		);
	}

	if (!isAbsolute(adbPath)) {
		throw new RemoteExportError(
			"ADB_PATH_NOT_ABSOLUTE",
			"The ADB path must be absolute (e.g. /opt/homebrew/bin/adb). Obsidian does not use your terminal's PATH."
		);
	}

	if (!existsSync(adbPath)) {
		throw new RemoteExportError(
			"ADB_NOT_FOUND",
			`ADB was not found at "${adbPath}". Run "which adb" in your terminal and paste the full path into the plugin settings.`
		);
	}

	try {
		accessSync(adbPath, constants.X_OK);
	} catch {
		throw new RemoteExportError(
			"ADB_NOT_EXECUTABLE",
			`ADB at "${adbPath}" is not executable. Check the path in the plugin settings, or run "chmod +x ${adbPath}".`
		);
	}
};

/**
 * Translates a failed adb invocation into an error whose message can be shown as-is.
 * Note that stderr is only consulted once the exit code has already told us the
 * command failed - adb writes daemon startup notices to stderr on successful runs.
 * @param result - The result of the adb command
 * @param adbPath - The absolute path to the ADB executable, quoted back to the user
 * @param timeoutMs - The timeout that was applied, reported in seconds
 */
const toAdbError = (
	result: CommandResult,
	adbPath: string,
	timeoutMs: number
): RemoteExportError => {
	if (result.timedOut) {
		return new RemoteExportError(
			"ADB_TIMEOUT",
			`ADB did not respond within ${Math.round(
				timeoutMs / 1000
			)} seconds. Try running "${adbPath} kill-server" in your terminal, then try again.`,
			result.stderr
		);
	}

	if (result.spawnError !== null) {
		return new RemoteExportError(
			"ADB_NOT_EXECUTABLE",
			`ADB at "${adbPath}" could not be run. Check the path in the plugin settings.`,
			result.spawnError.message
		);
	}

	const detail = firstLine(result.stderr);
	return new RemoteExportError(
		"ADB_FAILED",
		`ADB failed: ${detail === "" ? "no output" : detail}`,
		result.stderr
	);
};

/**
 * Parses the output of `adb devices -l`.
 * @param stdout - The raw output of the command
 */
export const parseDeviceList = (stdout: string): AndroidDevice[] => {
	return stdout
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line !== "" && !line.startsWith("List of devices"))
		//`adb devices -l` separates the serial from the state with whitespace
		.map((line) => line.split(/\s+/))
		.filter((parts) => parts.length >= 2)
		.map((parts) => ({ serial: parts[0], state: parts[1] }));
};

/**
 * Returns the serial of the single connected device.
 * @throws RemoteExportError if there is not exactly one usable device
 * @param adbPath - The absolute path to the ADB executable
 */
export const getConnectedDeviceSerial = async (
	adbPath: string
): Promise<string> => {
	const result = await runCommand(adbPath, ["devices", "-l"], {
		timeoutMs: ADB_DEVICES_TIMEOUT_MS,
	});

	if (result.code !== 0) {
		throw toAdbError(result, adbPath, ADB_DEVICES_TIMEOUT_MS);
	}

	const devices = parseDeviceList(result.stdout);

	if (devices.length === 0) {
		throw new RemoteExportError(
			"NO_DEVICES",
			"No devices found. Connect your device over USB, enable USB debugging, and try again."
		);
	}

	if (devices.length > 1) {
		const serials = devices.map((device) => device.serial).join(", ");
		throw new RemoteExportError(
			"MULTIPLE_DEVICES",
			`Multiple devices are connected (${serials}). Disconnect all but one and try again.`
		);
	}

	const [device] = devices;

	if (device.state === "unauthorized") {
		throw new RemoteExportError(
			"DEVICE_UNAUTHORIZED",
			'Device is unauthorized. Unlock the device, tap "Allow USB debugging", then try again.'
		);
	}

	if (device.state !== "device") {
		throw new RemoteExportError(
			"DEVICE_OFFLINE",
			"Device is offline. Reconnect the USB cable or toggle USB debugging off and on, then try again."
		);
	}

	return device.serial;
};

/**
 * Extracts the DevTools socket names from the contents of /proc/net/unix.
 * Abstract socket names are prefixed with an @ in that file.
 * @param stdout - The contents of /proc/net/unix
 */
export const parseDevToolsSockets = (stdout: string): string[] => {
	const matches = stdout.matchAll(/@([\w.-]*_devtools_remote[\w.-]*)/g);
	const names = Array.from(matches, (match) => match[1]);
	return Array.from(new Set(names));
};

/**
 * Picks the socket belonging to the configured browser.
 * The names are not guessed from a hardcoded table: they vary by browser build and
 * version, and a wrong guess produces exactly the silent failure this is meant to fix.
 * @param sockets - The socket names discovered on the device
 * @param appName - The configured remote browser application name
 */
export const matchDevToolsSocket = (
	sockets: string[],
	appName: string
): string | null => {
	const normalized = appName.toLowerCase().replace(/[\s.]/g, "");
	if (normalized === "") return null;

	const match = sockets.find((socket) =>
		socket.toLowerCase().includes(normalized)
	);
	if (match !== undefined) return match;

	//A single browser is listening but it isn't named what the user typed. Embedded
	//webviews are excluded because they are rarely what someone means to export.
	const candidates = sockets.filter(
		(socket) => !socket.startsWith("webview_")
	);
	if (candidates.length === 1) {
		console.warn(
			`No DevTools socket matched "${appName}". Falling back to the only one found: ${candidates[0]}`
		);
		return candidates[0];
	}

	return null;
};

/**
 * Discovers which browser on the device is exposing a DevTools socket.
 * This is the same mechanism Chrome's own "Discover USB devices" UI uses.
 * @throws RemoteExportError if nothing is listening or nothing matches the app name
 * @param adbPath - The absolute path to the ADB executable
 * @param serial - The serial of the connected device
 * @param appName - The configured remote browser application name
 */
export const findDevToolsSocket = async (
	adbPath: string,
	serial: string,
	appName: string
): Promise<string> => {
	const result = await runCommand(
		adbPath,
		["-s", serial, "shell", "cat", "/proc/net/unix"],
		{ timeoutMs: ADB_SHELL_TIMEOUT_MS }
	);

	//Some hardened builds refuse to read /proc/net/unix. Discovery must never be the
	//reason a setup that works today stops working.
	if (result.code !== 0) {
		console.warn(
			`Could not list sockets on the device, falling back to ${FALLBACK_DEVTOOLS_SOCKET}`,
			result.stderr
		);
		return FALLBACK_DEVTOOLS_SOCKET;
	}

	const sockets = parseDevToolsSockets(result.stdout);
	console.log(`Found DevTools sockets on the device: ${sockets.join(", ")}`);

	if (sockets.length === 0) {
		throw new RemoteExportError(
			"NO_DEVTOOLS_SOCKETS",
			`No debuggable browser found on the device. Make sure ${appName} is open on the device, then try again.`
		);
	}

	const socket = matchDevToolsSocket(sockets, appName);
	if (socket === null) {
		throw new RemoteExportError(
			"SOCKET_NAME_MISMATCH",
			`No browser matching "${appName}" is running on the device. Found: ${sockets.join(
				", "
			)}. Update the remote browser application name in the plugin settings.`
		);
	}

	return socket;
};

/**
 * Opens a port forward to the device and returns the local port that adb allocated.
 * Asking for tcp:0 lets adb pick a free port, so this can never collide with a
 * desktop browser already listening on the usual debugging port.
 *
 * Note that adb resolves the remote socket lazily, so this succeeding does not prove
 * the socket exists - that is what findDevToolsSocket is for.
 * @throws RemoteExportError if the forward could not be opened
 * @param adbPath - The absolute path to the ADB executable
 * @param serial - The serial of the connected device
 * @param socket - The name of the abstract socket to forward to
 */
export const openPortForward = async (
	adbPath: string,
	serial: string,
	socket: string
): Promise<number> => {
	const result = await runCommand(
		adbPath,
		["-s", serial, "forward", "tcp:0", `localabstract:${socket}`],
		{ timeoutMs: ADB_FORWARD_TIMEOUT_MS }
	);

	if (result.code !== 0) {
		const detail = firstLine(result.stderr);
		throw new RemoteExportError(
			"FORWARD_FAILED",
			`Could not open a connection to the device: ${
				detail === "" ? "adb gave no reason" : detail
			}`,
			result.stderr
		);
	}

	const port = Number.parseInt(result.stdout.trim(), 10);
	if (!Number.isInteger(port) || port <= 0) {
		throw new RemoteExportError(
			"FORWARD_FAILED",
			"Could not open a connection to the device: adb did not report a port.",
			result.stdout
		);
	}

	return port;
};

/**
 * Tears down a port forward. Never throws - this runs in a finally block, where
 * failing would mask the error that actually matters.
 * @param adbPath - The absolute path to the ADB executable
 * @param serial - The serial of the connected device
 * @param port - The local port to stop forwarding
 */
export const closePortForward = async (
	adbPath: string,
	serial: string,
	port: number
): Promise<void> => {
	try {
		const result = await runCommand(
			adbPath,
			["-s", serial, "forward", "--remove", `tcp:${port}`],
			{ timeoutMs: ADB_FORWARD_REMOVE_TIMEOUT_MS }
		);
		if (result.code !== 0) {
			console.warn(
				`Could not remove the port forward on tcp:${port}`,
				result.stderr
			);
		}
	} catch (err) {
		console.warn(`Could not remove the port forward on tcp:${port}`, err);
	}
};
