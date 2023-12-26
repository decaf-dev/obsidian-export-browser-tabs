export interface PluginSettings {
	vaultSavePath: string;
	browserApplicationName: string;
	fileName: string;
	urlFrontmatterKey: string;
	appendWebsiteType: boolean;
	excludedLinks: ExcludedLink[];
}

export interface ExcludedLink {
	url: string;
}
