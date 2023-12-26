import { App, Command, Notice } from "obsidian";
import { exportBrowserTabs } from "src/export";
import { createFile, createFolder } from "src/utils/file-utils";
import { getFrontmatterForFile } from "src/frontmatter-utils";
import { findLongestString, formatStringForFileSystem, removeQuotations, removeTrailingPeriod, removeWebsiteTitles, trimForFileSystem } from "src/utils/title-utils";
import { PluginSettings } from "src/types";
import { pipeline } from "src/utils/pipeline";

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
	const { vaultSavePath, browserApplicationName, urlFrontmatterKey } = settings;
	try {
		await createFolder(app, vaultSavePath);
		const tabs = await exportBrowserTabs(
			browserApplicationName
		);

		for (const tab of tabs) {
			const { title, url } = tab;

			const titlePipeline = pipeline(formatStringForFileSystem, removeQuotations, removeWebsiteTitles, findLongestString, removeTrailingPeriod);
			const titleString = titlePipeline(title);

			const trimmed = trimForFileSystem(titleString as string, "md");
			const fileName = `${trimmed}.md`;

			const filePath = `${vaultSavePath}/${fileName}`;
			const data = getFrontmatterForFile(urlFrontmatterKey, url);

			await createFile(
				app,
				filePath,
				data
			);
		}
		new Notice(
			`Exported ${tabs.length} browser tabs from ${browserApplicationName}`
		);
	} catch (err) {
		console.error(err);
		new Notice(`Error exporting browser tabs: ${err.message} `);
	}
};