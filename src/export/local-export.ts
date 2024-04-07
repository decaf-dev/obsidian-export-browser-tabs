import { exec as execCallback } from "child_process";
import { promisify } from "util";
import { BrowserTab } from "./types";
import { getEmptyTabTitle } from "src/utils/title-utils";
import { filterDuplicateTabs } from "./utils";

const exec = promisify(execCallback);

export const exportLocalTabs = async (browserApplicationName: string): Promise<BrowserTab[]> => {
	if (browserApplicationName === "") {
		throw new Error(
			"No local browser application name specified. Please set one in the plugin settings."
		);
	}

	/**
	* Target Application: The script targets the application "Brave". It assumes Brave is installed on your Mac and is scriptable through AppleScript.
	* Initialization: It initializes tabInfoList as an empty string.This variable is used to accumulate the information about each tab.
	* Outer Loop - Every Window: The script then enters a loop(repeat with theWindow in (every window)) that iterates over every window that is currently open in Brave.
	* Inner Loop - Every Tab: Inside each window, another loop(repeat with theTab in (every tab of theWindow)) iterates over every tab.
	* Gathering Information: For each tab, the script retrieves the URL(the URL of theTab) and the title(the title of theTab) of the tab.
	* Formatting: It formats this information by concatenating the URL and the title, separated by a pipe symbol(|), and adds a newline character(\n) at the end.This format is maintained for each tab.
	* Accumulating Data: The information for each tab is appended to tabInfoList, which grows as the script iterates through each tab in each window.
	* Output: Once all windows and tabs have been processed, the script returns the tabInfoList.
	* @example
	* http://example.com|Example Website
	* http://anotherexample.com|Another Example
	**/
	const appleScript = `
			tell application "${browserApplicationName}"
				set tabInfoList to ""
				repeat with theWindow in (every window)
					repeat with theTab in (every tab of theWindow)
						set tabInfoList to tabInfoList & the URL of theTab & "|" & the title of theTab & "\n"
					end repeat
				end repeat
				return tabInfoList
			end tell
		`;

	try {
		const { stdout, stderr } = await exec(`osascript -e '${appleScript}'`);
		if (stderr) {
			throw new Error(stderr);
		}
		const tabs: BrowserTab[] = stdout
			.trim()
			.split("\n")
			.map((entry) => {
				// Split the entry by the first occurrence of "|"
				const [url, ...titleParts] = entry.split("|");
				let title = titleParts.join("|"); // Rejoin the title in case it contains "|"

				//It's possible that the title is empty if the tab has not loaded yet
				if (title.trim() === "")
					title = getEmptyTabTitle();

				return { url, title };
			});
		const filteredTabs = filterDuplicateTabs(tabs);
		return filteredTabs;
	} catch (err) {
		throw err;
	}
}
