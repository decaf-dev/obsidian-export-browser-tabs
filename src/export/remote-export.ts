import { exec as execCallback } from "child_process";
import { promisify } from "util";
import { BrowserTab } from "./types";
import { getEmptyTabTitle } from "src/utils/title-utils";
import { filterDuplicateTabs } from "./utils";

const exec = promisify(execCallback);

export const exportRemoteTabs = async (browserApplicationName: string, adbPath: string): Promise<BrowserTab[]> => {
	if (browserApplicationName === "") {
		throw new Error(
			"No remote browser application name specified. Please set one in the plugin settings."
		);
	}

	if (adbPath === "") {
		throw new Error(
			"No ADB path specified. Please set one in the plugin settings."
		);
	}

	//forwarding will output 9222 so we need to redirect that to /dev/null
	let command = `
		if ! command -v "${adbPath}" &> /dev/null
		then
			echo "${adbPath} could not be found, please install it and run this script again."
			exit
		fi

		${adbPath} forward tcp:9222 localabstract:chrome_devtools_remote >/dev/null
		curl -s http://localhost:9222/json/list
		${adbPath} forward --remove tcp:9222
	`;


	try {
		const MAX_BUFFER_SIZE = 1024 * 1024 * 10;
		const { stdout, stderr } = await exec(command, { maxBuffer: MAX_BUFFER_SIZE });
		if (stderr) {
			throw new Error(stderr);
		}

		const arr = JSON.parse(stdout);
		const tabs: BrowserTab[] = arr.map((entry: unknown) => {
			const { url, title: originalTitle } = entry as {
				title: string, url: string
			}

			let title = originalTitle;
			//It's possible that the title is empty if the tab has not loaded yet
			if (title.trim() === "")
				title = getEmptyTabTitle();
			return {
				title,
				url
			}
		});
		const filteredTabs = filterDuplicateTabs(tabs);
		return filteredTabs;
	} catch (err: unknown) {
		const error = err as Error;
		if (error.message.includes("no devices/emulators found")) {
			throw new Error("No devices found. Please connect a device and try again.");
		}
		throw err;
	}
}
