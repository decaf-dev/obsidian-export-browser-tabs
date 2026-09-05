import { execFile as execFileCallback } from "child_process";

export interface CommandResult {
	stdout: string;
	stderr: string;
	/** The exit code, or null when the process was killed by a signal or never spawned */
	code: number | null;
	timedOut: boolean;
	/** Set when the process could not be spawned (ENOENT, EACCES) or its output overflowed */
	spawnError: Error | null;
}

interface RunCommandOptions {
	timeoutMs?: number;
	maxBuffer?: number;
}

const DEFAULT_MAX_BUFFER = 1024 * 1024;

/**
 * Runs an executable directly, without a shell. Arguments are passed as an array, so
 * paths containing spaces or quotes need no escaping.
 *
 * This never rejects. The same exit code means different things to different callers,
 * so the decision of what counts as a failure is left to them.
 * @param file - The absolute path to the executable
 * @param args - The arguments to pass to the executable
 * @param options - The timeout and max buffer size
 */
export const runCommand = async (
	file: string,
	args: string[],
	options: RunCommandOptions = {}
): Promise<CommandResult> => {
	const { timeoutMs, maxBuffer = DEFAULT_MAX_BUFFER } = options;

	return new Promise<CommandResult>((resolve) => {
		execFileCallback(
			file,
			args,
			{
				timeout: timeoutMs,
				//adb can ignore SIGTERM while it is starting its daemon
				killSignal: "SIGKILL",
				maxBuffer,
			},
			(err, stdout, stderr) => {
				if (err === null) {
					resolve({
						stdout,
						stderr,
						code: 0,
						timedOut: false,
						spawnError: null,
					});
					return;
				}

				const { killed, signal, code } = err as Error & {
					killed?: boolean;
					signal?: string | null;
					code?: number | string;
				};

				//A timeout kill and a maxBuffer overflow both surface as a killed process
				const timedOut = killed === true || signal === "SIGKILL";
				const isSpawnFailure =
					code === "ENOENT" ||
					code === "EACCES" ||
					code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER";

				resolve({
					stdout,
					stderr,
					code: typeof code === "number" ? code : null,
					timedOut: timedOut && !isSpawnFailure,
					spawnError: isSpawnFailure ? err : null,
				});
			}
		);
	});
};

/**
 * Returns the first non-empty line of a command's output, for use in a Notice.
 * Full output belongs in the console, not in a toast.
 * @param value - The output to take the first line of
 */
export const firstLine = (value: string): string => {
	const line = value
		.split("\n")
		.map((it) => it.trim())
		.find((it) => it !== "");
	return line ?? "";
};
