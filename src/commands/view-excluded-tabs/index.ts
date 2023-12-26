import { App, Command } from "obsidian";
import { EXCLUDED_TABS_VIEW } from "src/constants";

export const viewExcludedTabsCommand = (app: App): Command => {
	return {
		id: "view-excluded-tabs",
		name: "View excluded tabs",
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
