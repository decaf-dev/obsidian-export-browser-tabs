export interface PluginSettings {
	vaultSavePath: string;
	browserApplicationName: string;
	fileName: string;
	urlFrontmatterKey: string;
	appendWebsiteType: boolean;
	excludedTabs: ExcludedTab[];
}

export interface ExcludedTab {
	url: string;
}
