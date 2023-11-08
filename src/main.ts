import { Notice, Plugin } from "obsidian";
import { exec as execCallback } from "child_process";
import { promisify } from "util";
import SettingsTab from "./settings_tab";

const exec = promisify(execCallback);

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

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "export-browser-tabs",
			name: "Export tabs",
			callback: async () => {
				try {
					const numTabs = await this.exportBrowserTabs(
						this.settings.browserApplicationName
					);
					new Notice(
						`Exported ${numTabs} browser tabs from ${this.settings.browserApplicationName}`
					);
				} catch (err) {
					console.error(err);
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

	private async exportBrowserTabs(browserApplicationName: string) {
		const appleScript = `
		tell application "${browserApplicationName}"
			set tabList to {}
			repeat with theWindow in (every window)
				repeat with theTab in (every tab of theWindow)
					set the end of tabList to the URL of theTab
				end repeat
			end repeat
			return tabList
		end tell
		`;

		const { stdout, stderr } = await exec(`osascript -e '${appleScript}'`);
		if (stderr) {
			console.error(`stderr: ${stderr}`);
			return;
		}
		console.log(`stdout: ${stdout}`);
		return 0;
	}
}
