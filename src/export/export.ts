import { exec as execCallback } from "child_process";
import { promisify } from "util";

const exec = promisify(execCallback);

export const exportBrowserTabs = async (browserApplicationName: string) => {
	if (browserApplicationName === "") {
		throw new Error(
			"No browser application name specified. Please set one in the plugin settings."
		);
	}

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

	const { stdout, stderr } = await exec(`osascript -e '${appleScript}'`);
	if (stderr) {
		throw new Error(stderr);
	}
	const tabs = stdout
		.trim()
		.split("\n")
		.map((entry) => {
			// Split the entry by the first occurrence of "|"
			const [url, ...titleParts] = entry.split("|");
			const title = titleParts.join("|"); // Rejoin the title in case it contains "|"
			return { url, title };
		});

	//console.log("Tabs", tabs);
	return tabs;
}
