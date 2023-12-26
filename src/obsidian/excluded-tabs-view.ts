import { ItemView, WorkspaceLeaf } from "obsidian";
import { EXCLUDED_TABS_VIEW } from "src/constants";

export default class ExcludedTabsView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return EXCLUDED_TABS_VIEW;
	}

	getDisplayText() {
		return "Excluded tabs";
	}

	getIcon() {
		return "link";
	}

	async onOpen() {
		const { contentEl } = this;
		contentEl.setText("Hello world!");
	}
}
