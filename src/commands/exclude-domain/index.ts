import { App, Command, MarkdownView, Notice } from "obsidian";
import ExportBrowserTabsPlugin from "src/main";
import { getUrlForFile } from "src/utils/vault";

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
				const file = markdownView.file;
				if (!file) {
					return false;
				}
				const url = getUrlForFile(app, file);
				if (!url) {
					new Notice("No URL found in frontmatter");
					return false;
				}
				const domain = new URL(url).hostname;
				plugin.settings.excludedLinks.push({ url: domain });
				plugin.saveSettings();
				new Notice(`Excluded domain: ${domain}`);
			}
			return true;

		},
	}
}
