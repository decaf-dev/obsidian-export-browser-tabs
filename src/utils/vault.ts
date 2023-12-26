import { App } from "obsidian";

export const doesUrlExist = (app: App, url: string) => {
	const markdownFiles = app.vault.getMarkdownFiles();
	return markdownFiles.find((file) => {
		const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
		if (frontmatter && frontmatter.url === url) {
			return true;
		}
		return false;
	}) !== undefined;
}
