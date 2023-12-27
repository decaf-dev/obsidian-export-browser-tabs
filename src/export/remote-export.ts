import { exec as execCallback } from "child_process";
import { promisify } from "util";

const exec = promisify(execCallback);

export const exportRemoteTabs = async (browserApplicationName: string) => {
	if (browserApplicationName === "") {
		throw new Error(
			"No browser application name specified. Please set one in the plugin settings."
		);
	}

	let command = `
		if ! command -v adb &> /dev/null
		then
			echo "adb could not be found, please install it and run this script again."
			exit
		fi

		adb forward tcp:9222 localabstract:chrome_devtools_remote

		curl http://localhost:9222/json/list

		adb forward --remove tcp:9222
	`;

	const { stdout, stderr } = await exec(command);
	if (stderr) {
		throw new Error(stderr);
	}

	const tabs: {
		url: string;
		title: string;
	}[] = [];
	console.log(stdout);
	return tabs;
	// const tabs = stdout
	// const tabs = stdout
	// 	.split("\n")
	// 	.map((entry) => {
	// 		// Split the entry by the first occurrence of "|"
	// 		const [url, ...titleParts] = entry.split("|");
	// 		const title = titleParts.join("|"); // Rejoin the title in case it contains "|"
	// 		return { url, title };
	// 	});

	// //console.log("Tabs", tabs);
	// return tabs;
}
