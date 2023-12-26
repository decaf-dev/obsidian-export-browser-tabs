import { App, Command } from "obsidian";
import { EXCLUDED_VIEW } from "src/constants";

export const viewExcludedCommand = (app: App): Command => {
	return {
		id: "view-excluded",
		name: "View excluded URLs",
		callback: async () => {
			const leaf = app.workspace.getLeavesOfType(EXCLUDED_VIEW)[0];
			if (leaf) {
				app.workspace.revealLeaf(leaf);
			} else {
				app.workspace.getRightLeaf(false).setViewState({
					type: EXCLUDED_VIEW,
					active: true,
				})
			}
		},
	}
}
