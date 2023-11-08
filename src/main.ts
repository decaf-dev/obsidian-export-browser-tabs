import { Notice, Plugin } from "obsidian";

interface ExportBrowserTabsSettings {
	internalSavePath: string;
	browserApplicationName: string;
	fileNameFormat: string;
}

const DEFAULT_SETTINGS: ExportBrowserTabsSettings = {
	internalSavePath: "",
	browserApplicationName: "",
	fileNameFormat: "",
};

export default class ExportBrowserTabs extends Plugin {
	settings: ExportBrowserTabsSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "export-browser-tabs",
			name: "Export tabs",
			callback: async () => {
				try {
					const numTabs = await this.exportBrowserTabs();
					new Notice(
						`Exported ${numTabs} browser tabs from ${this.settings.browserApplicationName}`
					);
				} catch (err) {
					new Notice(`Error exporting browser tabs: ${err.message}`);
				}
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async exportBrowserTabs() {
		return 0;
	}
}
