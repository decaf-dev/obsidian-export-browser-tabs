import { App, Command, MarkdownView, Notice, TFile } from "obsidian";
import EventManager from "src/event/event-manager";
import ExportBrowserTabsPlugin from "src/main";
import { getFrontmatterUrl } from "src/utils/vault";

export const excludeDomainCommand = (app: App, plugin: ExportBrowserTabsPlugin): Command => {
	return {
		id: "exclude-domain",
		name: "Exclude domain",
		checkCallback: (checking: boolean
		) => {
			const markdownView =
				app.workspace.getActiveViewOfType(MarkdownView);
			if (!markdownView) {
				return false;
			}
			if (!checking) {
				preformAction(app, plugin, markdownView.file);
			}
			return true;

		},
	}
}

const preformAction = async (app: App, plugin: ExportBrowserTabsPlugin, file: TFile | null) => {
	if (!file) {
		return false;
	}
	const url = getFrontmatterUrl(app, file);
	if (!url) {
		new Notice("No URL found in frontmatter");
		return false;
	}
	const domain = new URL(url).hostname;
	plugin.settings.excludedLinks.push({ url: domain });
	await plugin.saveSettings();
	EventManager.getInstance().emit("refresh-item-view");
	new Notice(`Excluded domain: ${domain}`);
}
