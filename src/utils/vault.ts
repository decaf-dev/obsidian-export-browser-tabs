import { App, TFile } from "obsidian";

export const getFrontmatterUrl = (app: App, file: TFile): string | undefined => {
	const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
	return frontmatter?.url;
}

export const doesUrlExist = (app: App, url: string) => {
	const markdownFiles = app.vault.getMarkdownFiles();
	return markdownFiles.find((file) => {
		const frontmatterUrl = getFrontmatterUrl(app, file);
		if (frontmatterUrl === url) {
			return true;
		}
		return false;
	}) !== undefined;
}
