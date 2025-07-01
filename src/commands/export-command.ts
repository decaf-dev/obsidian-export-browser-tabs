import { App, Command, Notice } from "obsidian";
import { exportLocalTabs } from "src/export/local-export";
import { PluginSettings } from "src/types";
import { formatForFileSystem } from "src/utils/file-system-utils";
import { createFile, createFolder } from "src/utils/file-utils";
import { generateFrontmatter } from "src/utils/frontmatter-utils";
import { pipeline } from "src/utils/pipeline";
import { removeQueryParams } from "src/utils/string-utils";
import {
	removeNotificationCount,
	trimForFileSystem,
} from "src/utils/title-utils";
import { doesUrlExist } from "src/utils/vault";

export const exportCommand = (app: App, settings: PluginSettings): Command => {
	return {
		id: "export",
		name: "Export",
		callback: callback(app, settings),
	};
};

const callback = (app: App, settings: PluginSettings) => async () => {
	const { saveFolder, localBrowserAppName, urlProperty, excludedLinks } =
		settings;
	try {
		await createFolder(app, saveFolder);

		const tabs = await exportLocalTabs(localBrowserAppName);
		console.log(`Found ${tabs.length} browser tabs`);

		let numExportedTabs = 0;
		let numFailedTabs = 0;

		for (const tab of tabs) {
			const { title, url } = tab;

			try {
				if (excludedLinks.find((link) => url.includes(link))) {
					console.log(`URL is excluded: ${url}`);
					continue;
				}

				if (doesUrlExist(app, url)) {
					console.log(`URL already exists in vault: ${url}`);
					continue;
				}

				//Hnadle empty title
				const titlePipeline = pipeline(
					formatForFileSystem,
					removeNotificationCount,
					removeQueryParams
				);
				const formattedTitle = titlePipeline(title) as string;
				const trimmedTitle = trimForFileSystem(formattedTitle, ".md");

				const fileName = `${trimmedTitle}.md`;
				const filePath = `${saveFolder}/${fileName}`;
				const data = generateFrontmatter(urlProperty, url);

				await createFile(app, filePath, data);
				numExportedTabs++;
			} catch (err) {
				console.error(err);
				numFailedTabs++;
			}
		}
		new Notice(
			`Export complete: ${numExportedTabs} tabs exported from ${localBrowserAppName}${
				numFailedTabs > 0 ? `, ${numFailedTabs} failed` : ""
			}`
		);
	} catch (err) {
		console.error(err);
		new Notice(`Error exporting browser tabs: ${err.message} `);
	}
};
