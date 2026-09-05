import { DEVTOOLS_TIMEOUT_MS } from "src/constants";
import {
	closePortForward,
	findDevToolsSocket,
	getConnectedDeviceSerial,
	openPortForward,
	validateAdbPath,
} from "./adb";
import { fetchDevToolsTargets, parseDevToolsTargets } from "./devtools";
import { RemoteExportError } from "./errors";
import { BrowserTab } from "./types";

/**
 * Reads the open tabs from a browser running on a connected Android device.
 *
 * Each step runs as its own checked subprocess so that a failure can say which stage
 * broke and what the user should do about it.
 * @throws RemoteExportError with a message suitable for showing to the user
 * @param browserApplicationName - The name of the browser running on the device
 * @param adbPath - The absolute path to the ADB executable
 */
export const exportRemoteTabs = async (
	browserApplicationName: string,
	adbPath: string
): Promise<BrowserTab[]> => {
	if (browserApplicationName === "") {
		throw new RemoteExportError(
			"MISSING_APP_NAME",
			"No remote browser application name specified. Please set one in the plugin settings."
		);
	}

	validateAdbPath(adbPath);

	const serial = await getConnectedDeviceSerial(adbPath);
	const socket = await findDevToolsSocket(
		adbPath,
		serial,
		browserApplicationName
	);
	const port = await openPortForward(adbPath, serial, socket);

	//Opened after the forward exists, so cleanup only runs for a forward we created
	try {
		const payload = await fetchDevToolsTargets(
			port,
			DEVTOOLS_TIMEOUT_MS,
			browserApplicationName
		);
		return parseDevToolsTargets(payload);
	} finally {
		await closePortForward(adbPath, serial, port);
	}
};
