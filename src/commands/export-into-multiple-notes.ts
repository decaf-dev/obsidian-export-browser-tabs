import { App, Command, Notice } from "obsidian";
import { exportBrowserTabs } from "src/export/export";
import { createFile, createFolder } from "src/utils/file-utils";
import { getFrontmatterForFile } from "src/utils/frontmatter-utils";
import { findLongestString, removeQuotations, removeTrailingPeriod, removeWebsiteTitles, trimForObsidian } from "src/utils/title-utils";
import { PluginSettings } from "src/types";
import { pipeline } from "src/utils/pipeline";
import { formatForFileSystem, trimForFileSystem } from "src/utils/file-system-utils";
import { toSentenceCase } from "src/utils/string-utils";

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

			const titlePipeline = pipeline(formatForFileSystem, removeQuotations, removeWebsiteTitles, findLongestString, removeTrailingPeriod);
			const titleString = titlePipeline(title);

			const trimmed = trimForObsidian(titleString as string, "md");
			const sentenceCase = toSentenceCase(trimmed);
			const fileName = `${sentenceCase}.md`;

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
