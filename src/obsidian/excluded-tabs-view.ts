import { ItemView, WorkspaceLeaf } from "obsidian";
import { EXCLUDED_VIEW } from "src/constants";

export default class ExcludedView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return EXCLUDED_VIEW;
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
