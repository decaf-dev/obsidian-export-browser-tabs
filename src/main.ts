import { Plugin } from "obsidian";
import SettingsTab from "./obsidian/settings-tab";
import { exportIntoSingleNoteCommand } from "./commands/export-into-single-note";
import { exportIntoMultipleNotesCommand } from "./commands/export-into-multiple-notes";
import { PluginSettings } from "./types";
import ExcludedTabsView from "./obsidian/excluded-tabs-view";
import { viewExcludedCommand } from "./commands/view-excluded-tabs";
import { EXCLUDED_TABS_VIEW } from "./constants";

const DEFAULT_SETTINGS: PluginSettings = {
	vaultSavePath: "",
	browserApplicationName: "",
	fileName: "Browser tabs",
	urlFrontmatterKey: "url",
	appendWebsiteType: false,
};

export default class ExportBrowserTabsPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));

		this.registerView(
			EXCLUDED_TABS_VIEW,
			(leaf) => new ExcludedTabsView(leaf),
		);

		// Register commands
		this.addCommand(exportIntoSingleNoteCommand(this.app, this.settings));
		this.addCommand(exportIntoMultipleNotesCommand(this.app, this.settings));
		this.addCommand(viewExcludedCommand(this.app));
	}

	onunload() { }

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
