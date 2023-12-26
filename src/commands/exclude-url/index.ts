import { App, Command, MarkdownView, Notice } from "obsidian";
import ExportBrowserTabsPlugin from "src/main";
import { getUrlForFile } from "src/utils/vault";

export const excludeUrlCommand = (app: App, plugin: ExportBrowserTabsPlugin): Command => {
	return {
		id: "exclude-url",
		name: "Exclude url",
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
				plugin.settings.excludedLinks.push({ url });
				plugin.saveSettings();
				new Notice(`Excluded url: ${url}`);
			}
			return true;

		},
	}
}
