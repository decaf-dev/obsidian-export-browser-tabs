import { App, Command, Notice } from "obsidian";
import { exportRemoteTabs } from "src/export/remote-export";
import { PluginSettings } from "src/types";
import { formatForFileSystem } from "src/utils/file-system-utils";
import { createFileByParts, createFolder } from "src/utils/file-utils";
import { generateFrontmatter } from "src/utils/frontmatter-utils";
import { pipeline } from "src/utils/pipeline";
import { decodeHtmlEntities } from "src/utils/string-utils";
import {
	removeNotificationCount,
	trimForFileSystem,
} from "src/utils/title-utils";
import { doesUrlExist } from "src/utils/vault";

export const exportTabsRemoteCommand = (
	app: App,
	settings: PluginSettings
): Command => {
	return {
		id: "export-browser-tabs-remote",
		name: "Export browser tabs (remote)",
		callback: callback(app, settings),
	};
};

const callback = (app: App, settings: PluginSettings) => async () => {
	const {
		saveFolder,
		remoteBrowserAppName,
		urlProperty: urlFrontmatterKey,
		excludedLinks,
		adbPath,
	} = settings;
	try {
		await createFolder(app, saveFolder);
		const tabs = await exportRemoteTabs(remoteBrowserAppName, adbPath);
		console.log(`Found ${tabs.length} remote browser tabs`);

		let numExportedTabs = 0;

		for (const tab of tabs) {
			const { title, url } = tab;

			if (excludedLinks.find((link) => url.includes(link))) {
				console.log(`URL is excluded: ${url}`);
				continue;
			}

			if (doesUrlExist(app, url)) {
				console.log(`URL already exists in vault: ${url}`);
				continue;
			}

			const titlePipeline = pipeline(
				decodeHtmlEntities,
				formatForFileSystem,
				removeNotificationCount
			);
			const formattedTitle = titlePipeline(title) as string;
			const trimmedTitle = trimForFileSystem(formattedTitle, ".md");
			const data = generateFrontmatter(urlFrontmatterKey, url);

			await createFileByParts(app, saveFolder, trimmedTitle, "md", data);
			numExportedTabs++;
		}
		new Notice(
			`Exported ${numExportedTabs} remote browser tabs from ${remoteBrowserAppName}`
		);
		console.log(
			`Exported ${numExportedTabs} remote browser tabs from ${remoteBrowserAppName}`
		);
	} catch (err) {
		console.error(err);
		new Notice(`Error exporting browser tabs: ${err.message} `);
	}
};
