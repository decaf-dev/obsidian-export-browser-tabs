import { App, Command, Notice } from "obsidian";
import { createFile, createFolder } from "src/utils/file-utils";
import { PluginSettings } from "src/types";
import { exportLocalTabs } from "src/export/local-export";

export const exportIntoSingleNoteCommand = (app: App, settings: PluginSettings): Command => {
	return {
		id: "export-into-single-note",
		name: "Export into single note",
		callback: callback(app, settings),
	};
};

const callback = (app: App, settings: PluginSettings) => async () => {
	const { vaultSavePath, localBrowserAppName, fileName } = settings;
	try {
		await createFolder(app, vaultSavePath);
		const tabs = await exportLocalTabs(
			localBrowserAppName
		);
		const markdownLinks = tabs.map((tab) => `[${tab.title}](${tab.url})`);

		const filePath = `${vaultSavePath}/${fileName} ${Date.now()}.md`;
		await createFile(
			app,
			filePath,
			markdownLinks.join("\n\n")
		);
		new Notice(
			`Exported ${tabs.length} browser tabs from ${localBrowserAppName}`
		);
		console.log(`Exported ${tabs.length} browser tabs from ${localBrowserAppName}`);
	} catch (err) {
		console.error(err);
		new Notice(`Error exporting browser tabs: ${err.message}`);
	}
};
