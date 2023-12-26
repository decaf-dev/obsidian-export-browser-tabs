import { ItemView, Menu, WorkspaceLeaf } from "obsidian";
import { EXCLUDED_LINKS_VIEW } from "src/constants";
import EventManager from "src/event/event-manager";
import ExportBrowserTabsPlugin from "src/main";

export default class ExcludedLinksView extends ItemView {
	plugin: ExportBrowserTabsPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: ExportBrowserTabsPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return EXCLUDED_LINKS_VIEW;
	}

	getDisplayText() {
		return "Excluded links";
	}

	getIcon() {
		return "link-2";
	}

	async onOpen() {
		const { contentEl } = this;

		const { settings } = this.plugin;
		const { excludedLinks } = settings;

		EventManager.getInstance().on("refresh-item-view", this.handleRefreshEvent);

		if (excludedLinks.length === 0) {
			contentEl.createDiv({ cls: "pane-empty", text: "No excluded links found." });
			return;
		}

		for (const link of excludedLinks) {
			const containerEl = contentEl.createDiv({ cls: "tree-item" });
			const div = containerEl.createDiv({ cls: "tree-item-self is-clickable", text: link.url });
			div.addEventListener("contextmenu", (e) => {
				const menu = new Menu();
				menu.addItem((item) => {
					item.setTitle("Remove");
					item.onClick(async () => {
						const index = excludedLinks.findIndex((t) => t.url === link.url);
						if (index > -1) {
							excludedLinks.splice(index, 1);
							this.plugin.settings.excludedLinks = excludedLinks;
							await this.plugin.saveSettings();
							div.remove();
						}
						this.handleRefreshEvent();
					});
				});
				menu.setUseNativeMenu(true);
				menu.showAtPosition({ x: e.clientX, y: e.clientY });
			});
		}
	}

	async onClose() {
		const { contentEl } = this;
		contentEl.empty();

		EventManager.getInstance().off("refresh-item-view", this.handleRefreshEvent);
	}

	private handleRefreshEvent = () => {
		this.onClose();
		this.onOpen();
	}
}
