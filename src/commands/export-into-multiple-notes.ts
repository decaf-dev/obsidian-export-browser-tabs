import { App, Command, Notice } from "obsidian";
import { exportBrowserTabs } from "src/export";
import { createFile, createFolder } from "src/utils/file-utils";
import { getFrontmatterForFile } from "src/frontmatter-utils";
import { formatStringForFileSystem, trimForFileSystem } from "src/utils/title-utils";
import { PluginSettings } from "src/types";

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

			const formatted = formatStringForFileSystem(title);
			const fileName = `${formatted}.md`;
			const trimmed = trimForFileSystem(fileName, "md");

			const filePath = `${vaultSavePath}/${trimmed}`;
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
