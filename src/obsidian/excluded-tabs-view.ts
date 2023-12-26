import { ItemView, Menu, WorkspaceLeaf } from "obsidian";
import { EXCLUDED_TABS_VIEW } from "src/constants";
import ExportBrowserTabsPlugin from "src/main";

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

		if (excludedTabs.length === 0) {
			contentEl.createDiv({ cls: "pane-empty", text: "No excluded tabs found." });
			return;
		}

		for (const tab of excludedTabs) {
			const containerEl = contentEl.createDiv({ cls: "tree-item" });
			const div = containerEl.createDiv({ cls: "tree-item-self is-clickable", text: tab.url });
			div.addEventListener("contextmenu", (e) => {
				const menu = new Menu();
				menu.addItem((item) => {
					item.setTitle("Remove");
					item.onClick(async () => {
						const index = excludedTabs.findIndex((t) => t.url === tab.url);
						if (index > -1) {
							excludedTabs.splice(index, 1);
							this.plugin.settings.excludedTabs = excludedTabs;
							await this.plugin.saveSettings();
							div.remove();
						}
						this.onOpen();
					});
				});
				menu.setUseNativeMenu(true);
				menu.showAtPosition({ x: e.clientX, y: e.clientY });
			});
		}
	}
}
