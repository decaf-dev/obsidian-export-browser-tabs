import { App, Command, Notice } from "obsidian";
import { createFile, createFolder } from "src/utils/file-utils";
import { generateFrontmatter } from "src/utils/frontmatter-utils";
import { removeNotificationCount, trimForFileSystem } from "src/utils/title-utils";
import { PluginSettings } from "src/types";
import { pipeline } from "src/utils/pipeline";
import { formatForFileSystem } from "src/utils/file-system-utils";
import { doesUrlExist } from "src/utils/vault";
import { exportLocalTabs } from "src/export/local-export";

export const exportIntoMultipleNotesCommand = (
	app: App,
	settings: PluginSettings
): Command => {
	return {
		id: "export-into-multiple-notes",
		name: "Export into multiple notes",
		callback: callback(app, settings),
	};
};

const callback = (app: App, settings: PluginSettings) => async () => {
	const { vaultSavePath, localBrowserAppName, urlFrontmatterKey, excludedLinks } = settings;
	try {
		await createFolder(app, vaultSavePath);
		const tabs = await exportLocalTabs(
			localBrowserAppName
		);
		console.log(`Found ${tabs.length} browser tabs`);

		let numExportedTabs = 0;

		for (const tab of tabs) {
			const { title, url } = tab;

			if (excludedLinks.find(link =>
				url.includes(link)
			)) {
				console.log(`URL is excluded: ${url}`);
				continue;
			}

			if (doesUrlExist(app, url)) {
				console.log(`URL already exists in vault: ${url}`);
				continue;
			}

			//Hnadle empty title
			const titlePipeline = pipeline(formatForFileSystem, removeNotificationCount);
			const formattedTitle = titlePipeline(title) as string;
			const trimmedTitle = trimForFileSystem(formattedTitle, ".md");

			const fileName = `${trimmedTitle}.md`;
			const filePath = `${vaultSavePath}/${fileName}`;
			const data = generateFrontmatter(urlFrontmatterKey, url);

			await createFile(
				app,
				filePath,
				data
			);
			numExportedTabs++;
		}
		new Notice(
			`Exported ${numExportedTabs} browser tabs from ${localBrowserAppName}`
		);
	} catch (err) {
		console.error(err);
		new Notice(`Error exporting browser tabs: ${err.message} `);
	}
};
