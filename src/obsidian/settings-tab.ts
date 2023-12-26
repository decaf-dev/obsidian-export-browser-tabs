import { PluginSettingTab, App, Setting } from "obsidian";
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
		this.addSingleNoteSettings(containerEl);
		this.renderMultipleNoteSettings(containerEl);

	}

	renderGeneralSettings(containerEl: HTMLElement): void {
		new Setting(containerEl).setHeading().setName("General");

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
	}

	addSingleNoteSettings(containerEl: HTMLElement): void {
		new Setting(containerEl).setHeading().setName("Export into single note");


		new Setting(containerEl)
			.setName("Folder save path")
			.setDesc(
				"The internal Obsidian path to save the exported tabs file to."
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.vaultSavePath)
					.onChange(async (value) => {
						this.plugin.settings.vaultSavePath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("File name")
			.setDesc(
				"The file name to use when saving the exported tabs. A timestamp will be appended to the end."
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.fileName)
					.onChange(async (value) => {
						this.plugin.settings.fileName = value;
						await this.plugin.saveSettings();
					})
			);
	}

	renderMultipleNoteSettings(containerEl: HTMLElement): void {
		new Setting(containerEl).setHeading().setName("Export into multiple notes");

		new Setting(containerEl)
			.setName("URL frontmatter key")
			.setDesc(
				"The frontmatter key that the URL will be saved under."
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.urlFrontmatterKey)
					.onChange(async (value) => {
						this.plugin.settings.urlFrontmatterKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Append website type")
			.setDesc(
				"Appends a website type to the end of the title. For example, if the website includes 'YouTube', (YouTube) will be appended to the end of the title."
			)
			.addToggle((text) =>
				text
					.setValue(this.plugin.settings.appendWebsiteType)
					.onChange(async (value) => {
						this.plugin.settings.appendWebsiteType = value;
						await this.plugin.saveSettings();
					})
			);
	}
}