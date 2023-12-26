import { ItemView, Menu, WorkspaceLeaf } from "obsidian";
import { EXCLUDED_TABS_VIEW } from "src/constants";
import ExportBrowserTabsPlugin from "src/main";
import { PluginSettings } from "src/types";

export default class ExcludedTabsView extends ItemView {
	plugin: ExportBrowserTabsPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: ExportBrowserTabsPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return EXCLUDED_TABS_VIEW;
	}

	getDisplayText() {
		return "Excluded tabs";
	}

	getIcon() {
		return "link-2";
	}

	async onOpen() {
		const { contentEl } = this;

		const { settings } = this.plugin;
		const { excludedTabs } = settings;
		for (const tab of excludedTabs) {
			const div = contentEl.createDiv({ cls: "is-clickable", text: tab.url });
			div.addEventListener("contextmenu", (e) => {
				const menu = new Menu();
				menu.addItem((item) => {
					item.setTitle("Remove");
					item.setIcon("trash");
					item.onClick(async () => {
						const index = excludedTabs.findIndex((t) => t.url === tab.url);
						if (index > -1) {
							excludedTabs.splice(index, 1);
							this.plugin.settings.excludedTabs = excludedTabs;
							await this.plugin.saveSettings();
							div.remove();
						}
					});
				});
				menu.setUseNativeMenu(true);
				menu.showAtPosition({ x: e.clientX, y: e.clientY });
			});
		}
	}
}
