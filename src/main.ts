import { Notice, Plugin, normalizePath } from "obsidian";
import { exec as execCallback } from "child_process";
import { promisify } from "util";
import SettingsTab from "./settings_tab";

const exec = promisify(execCallback);

interface ExportBrowserTabsSettings {
	vaultSavePath: string;
	browserApplicationName: string;
	fileName: string;
}

const DEFAULT_SETTINGS: ExportBrowserTabsSettings = {
	vaultSavePath: "",
	browserApplicationName: "",
	fileName: "Browser tabs",
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
					await this.createFolder(this.settings.vaultSavePath);
					const tabs = await this.exportBrowserTabs(
						this.settings.browserApplicationName
					);
					const markdownLinks = tabs.map(
						(tab) => `[${tab.title}](${tab.url})`
					);
					await this.createFile(
						this.settings.vaultSavePath,
						this.settings.fileName,
						markdownLinks.join("\n\n")
					);
					new Notice(
						`Exported ${tabs.length} browser tabs from ${this.settings.browserApplicationName}`
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
		if (browserApplicationName === "") {
			throw new Error(
				"No browser application name specified. Please set one in the plugin settings."
			);
		}

		const appleScript = `
			tell application "${browserApplicationName}"
				set tabInfoList to ""
				repeat with theWindow in (every window)
					repeat with theTab in (every tab of theWindow)
						set tabInfoList to tabInfoList & the URL of theTab & "|" & the title of theTab & "\n"
					end repeat
				end repeat
				return tabInfoList
			end tell
		`;

		const { stdout, stderr } = await exec(`osascript -e '${appleScript}'`);
		if (stderr) {
			throw new Error(stderr);
		}
		const tabs = stdout
			.trim()
			.split("\n")
			.map((entry) => {
				// Split the entry by the first occurrence of "|"
				const [url, ...titleParts] = entry.split("|");
				const title = titleParts.join("|"); // Rejoin the title in case it contains "|"
				return { url, title };
			});

		//console.log("Tabs", tabs);
		return tabs;
	}

	private async createFolder(folderPath: string) {
		try {
			await this.app.vault.createFolder(folderPath);
		} catch (err) {
			if (err.message.includes("already exists")) {
				return;
			}
			throw err;
		}
	}

	private async createFile(
		vaultSavePath: string,
		fileName: string,
		data: string
	) {
		const newFilePath = `${vaultSavePath}/${fileName} ${Date.now()}.md`;
		const normalizedFilePath = normalizePath(newFilePath);
		await this.app.vault.create(normalizedFilePath, data);
	}
}
