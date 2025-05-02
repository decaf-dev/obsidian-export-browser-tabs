import { Plugin } from "obsidian";
import { excludeDomainCommand } from "./commands/exclude-domain";
import { excludeUrlCommand } from "./commands/exclude-url";
import { exportBrowserTabsRemoteCommand } from "./commands/export-browser-tabs-remote-command";
import { exportBrowserTabsCommand } from "./commands/export-notes-command";
import { showExcludedLinksCommand } from "./commands/show-excluded-tabs";
import { EXCLUDED_LINKS_VIEW } from "./constants";
import ExcludedTabsView from "./obsidian/excluded-links-view";
import SettingsTab from "./obsidian/settings-tab";
import { PluginSettings } from "./types";

const DEFAULT_SETTINGS: PluginSettings = {
	saveFolder: "",
	localBrowserAppName: "",
	remoteBrowserAppName: "",
	urlProperty: "url",
	excludedLinks: [],
	adbPath: "",
};

export default class ExportBrowserTabsPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));

		this.registerView(
			EXCLUDED_LINKS_VIEW,
			(leaf) => new ExcludedTabsView(leaf, this)
		);

		// Register commands
		this.addCommand(exportBrowserTabsCommand(this.app, this.settings));
		this.addCommand(
			exportBrowserTabsRemoteCommand(this.app, this.settings)
		);
		this.addCommand(showExcludedLinksCommand(this.app));
		this.addCommand(excludeUrlCommand(this.app, this));
		this.addCommand(excludeDomainCommand(this.app, this));
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
}
