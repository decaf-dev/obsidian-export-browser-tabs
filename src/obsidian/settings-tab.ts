import { App, PluginSettingTab, Setting } from "obsidian";
import ExportBrowserTabs from "../main";

export default class SettingsTab extends PluginSettingTab {
	plugin: ExportBrowserTabs;

	constructor(app: App, plugin: ExportBrowserTabs) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		this.renderGeneralSettings(containerEl);
		this.renderRemoteSettings(containerEl);
	}

	renderGeneralSettings(containerEl: HTMLElement): void {
		new Setting(containerEl).setHeading().setName("General");

		new Setting(containerEl)
			.setName("Local browser application name")
			.setDesc(
				"The name of the browser application to export tabs from. e.g. brave or chrome"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.localBrowserAppName)
					.onChange(async (value) => {
						this.plugin.settings.localBrowserAppName = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Save folder")
			.setDesc("The folder to save the exported tabs to.")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.saveFolder)
					.onChange(async (value) => {
						this.plugin.settings.saveFolder = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("URL property")
			.setDesc("The property that the URL will be saved in.")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.urlProperty)
					.onChange(async (value) => {
						this.plugin.settings.urlProperty = value;
						await this.plugin.saveSettings();
					})
			);
	}

	renderRemoteSettings(containerEl: HTMLElement): void {
		new Setting(containerEl).setHeading().setName("Remote");

		new Setting(containerEl)
			.setName("ADB path")
			.setDesc(
				"The absolute path to the ADB executable on your machine. This can be found by running 'which adb' in your terminal."
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.adbPath)
					.onChange(async (value) => {
						this.plugin.settings.adbPath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Remote browser application name")
			.setDesc(
				"The name of the remote browser application to export tabs from. e.g. brave or chrome"
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.remoteBrowserAppName)
					.onChange(async (value) => {
						this.plugin.settings.remoteBrowserAppName = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
