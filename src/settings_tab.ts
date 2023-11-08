import { PluginSettingTab, App, Setting } from "obsidian";
import ExportBrowserTabs from "./main";

export default class SettingsTab extends PluginSettingTab {
	plugin: ExportBrowserTabs;

	constructor(app: App, plugin: ExportBrowserTabs) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Browser application name")
			.setDesc(
				"The name of the browser application to export tabs from. This will be used in AppleScript commands."
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.browserApplicationName)
					.onChange(async (value) => {
						this.plugin.settings.browserApplicationName = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Folder save path")
			.setDesc(
				"The internal Obsidian path to save the exported tabs file to."
			)
			.addSearch((text) =>
				text
					.setValue(this.plugin.settings.internalSavePath)
					.onChange(async (value) => {
						this.plugin.settings.internalSavePath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("File name format")
			.setDesc(
				"The file name format to use when saving the exported tabs."
			)
			.addSearch((text) =>
				text
					.setValue(this.plugin.settings.fileNameFormat)
					.onChange(async (value) => {
						this.plugin.settings.fileNameFormat = value;
						await this.plugin.saveSettings();
					})
			);
	}
}