import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import {
	findDevToolsSocket,
	getConnectedDeviceSerial,
	validateAdbPath,
} from "src/export/adb";
import { getErrorMessage } from "src/export/errors";
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
				"The absolute path to the ADB executable on your machine. Find it by running 'which adb' in your terminal. It must be absolute, because Obsidian does not use your terminal's PATH."
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
				"The name of the remote browser application to export tabs from. e.g. brave or chrome. This is matched against the debugging sockets found on the device."
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.remoteBrowserAppName)
					.onChange(async (value) => {
						this.plugin.settings.remoteBrowserAppName = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Test connection")
			.setDesc(
				"Check that ADB can reach your device and find the browser, without exporting anything."
			)
			.addButton((button) =>
				button.setButtonText("Test").onClick(async () => {
					button.setDisabled(true);
					button.setButtonText("Testing...");
					try {
						await this.testConnection();
					} finally {
						button.setDisabled(false);
						button.setButtonText("Test");
					}
				})
			);
	}

	/**
	 * Runs the connection steps of a remote export and reports where it got to.
	 * This exists so that a failing export can be diagnosed from the settings, rather
	 * than only ever being reported as an export that found nothing.
	 */
	async testConnection(): Promise<void> {
		const { adbPath, remoteBrowserAppName } = this.plugin.settings;
		try {
			if (remoteBrowserAppName === "") {
				throw new Error(
					"No remote browser application name specified. Please set one above."
				);
			}
			validateAdbPath(adbPath);
			const serial = await getConnectedDeviceSerial(adbPath);
			const socket = await findDevToolsSocket(
				adbPath,
				serial,
				remoteBrowserAppName
			);
			new Notice(`Connected to ${serial}, found ${socket}`, 10_000);
		} catch (err) {
			console.error(err);
			new Notice(getErrorMessage(err), 10_000);
		}
	}
}
