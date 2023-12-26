import { App, Command } from "obsidian";
import { EXCLUDED_LINKS_VIEW } from "src/constants";

export const showExcludedLinksCommand = (app: App): Command => {
	return {
		id: "show-excluded-links",
		name: "Show excluded links",
		callback: async () => {
			const leaf = app.workspace.getLeavesOfType(EXCLUDED_LINKS_VIEW)[0];
			if (leaf) {
				app.workspace.revealLeaf(leaf);
			} else {
				app.workspace.getRightLeaf(false).setViewState({
					type: EXCLUDED_LINKS_VIEW,
					active: true,
				})
			}
		},
	}
}
