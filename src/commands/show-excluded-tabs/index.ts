import { App, Command } from "obsidian";
import { EXCLUDED_TABS_VIEW } from "src/constants";

export const showExcludedTabsCommand = (app: App): Command => {
	return {
		id: "show-excluded-tabs",
		name: "Show excluded tabs",
		callback: async () => {
			const leaf = app.workspace.getLeavesOfType(EXCLUDED_TABS_VIEW)[0];
			if (leaf) {
				app.workspace.revealLeaf(leaf);
			} else {
				app.workspace.getRightLeaf(false).setViewState({
					type: EXCLUDED_TABS_VIEW,
					active: true,
				})
			}
		},
	}
}
