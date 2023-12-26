import { App, TFile } from "obsidian";

export const getUrlForFile = (app: App, file: TFile): string | undefined => {
	const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
	return frontmatter?.url;
}

export const doesUrlExist = (app: App, url: string) => {
	const markdownFiles = app.vault.getMarkdownFiles();
	return markdownFiles.find((file) => {
		const url = getUrlForFile(app, file);
		if (url)
			return true;
		return false;
	}) !== undefined;
}
