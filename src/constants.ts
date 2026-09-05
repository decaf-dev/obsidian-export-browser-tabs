export const EXCLUDED_LINKS_VIEW = "excluded-links";

/** `adb devices` has to start the adb daemon on a cold run, which is slow */
export const ADB_DEVICES_TIMEOUT_MS = 15_000;
export const ADB_SHELL_TIMEOUT_MS = 10_000;
export const ADB_FORWARD_TIMEOUT_MS = 10_000;
export const ADB_FORWARD_REMOVE_TIMEOUT_MS = 5_000;
export const DEVTOOLS_TIMEOUT_MS = 5_000;

/** The socket used when the device will not let us enumerate what is listening */
export const FALLBACK_DEVTOOLS_SOCKET = "chrome_devtools_remote";
