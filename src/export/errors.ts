export type RemoteExportErrorCode =
	| "MISSING_ADB_PATH"
	| "ADB_PATH_NOT_ABSOLUTE"
	| "ADB_NOT_FOUND"
	| "ADB_NOT_EXECUTABLE"
	| "ADB_TIMEOUT"
	| "ADB_FAILED"
	| "NO_DEVICES"
	| "DEVICE_UNAUTHORIZED"
	| "DEVICE_OFFLINE"
	| "MULTIPLE_DEVICES"
	| "MISSING_APP_NAME"
	| "MISSING_SAVE_FOLDER"
	| "NO_DEVTOOLS_SOCKETS"
	| "SOCKET_NAME_MISMATCH"
	| "FORWARD_FAILED"
	| "DEVTOOLS_CONNECTION_REFUSED"
	| "DEVTOOLS_TIMEOUT"
	| "DEVTOOLS_BAD_STATUS"
	| "DEVTOOLS_INVALID_RESPONSE"
	| "EXPORT_ALREADY_RUNNING";

/**
 * An error with a message that is ready to be shown in a Notice as-is.
 * Anything too long or too technical for a toast belongs in `detail`, which is
 * only ever written to the console.
 */
export class RemoteExportError extends Error {
	code: RemoteExportErrorCode;
	detail?: string;

	constructor(
		code: RemoteExportErrorCode,
		message: string,
		detail?: string
	) {
		super(message);
		this.name = "RemoteExportError";
		this.code = code;
		this.detail = detail;
	}
}

/**
 * Normalizes an unknown catch binding into a message that can be shown to the user.
 * A thrown non-Error would otherwise render as "undefined".
 * @param err - The caught value
 */
export const getErrorMessage = (err: unknown): string => {
	if (err instanceof RemoteExportError) {
		return err.message;
	}
	if (err instanceof Error) {
		return `Error exporting browser tabs: ${err.message}`;
	}
	return `Error exporting browser tabs: ${String(err)}`;
};
