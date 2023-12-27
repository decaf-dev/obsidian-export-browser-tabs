import { App, Command, Notice } from "obsidian";
import { createFile, createFolder } from "src/utils/file-utils";
import { generateFrontmatter } from "src/utils/frontmatter-utils";
import { appendWebsiteTitle, getWebsiteTitle, removeTrailingHyphen, removeTrailingPeriod, removeWebsiteTitles, trimForObsidian } from "src/utils/title-utils";
import { PluginSettings } from "src/types";
import { pipeline } from "src/utils/pipeline";
import { formatForFileSystem } from "src/utils/file-system-utils";
import { toSentenceCase } from "src/utils/string-utils";
import { doesUrlExist } from "src/utils/vault";
import { exportRemoteTabs } from "src/export/remote-export";

export const exportIntoMultipleNotesRemoteCommand = (app: App, settings: PluginSettings): Command => {
	return {
		id: "export-into-multiple-notes-remote",
		name: "Export into multiple notes (remote)",
		callback: callback(app, settings),
	}
}

const callback = (app: App, settings: PluginSettings) => async () => {
	const { vaultSavePath, remoteBrowserAppName, urlFrontmatterKey, excludedLinks } = settings;
	try {
		await createFolder(app, vaultSavePath);
		const tabs = await exportRemoteTabs(
			remoteBrowserAppName
		);
		console.log(`Found ${tabs.length} remote browser tabs`);

		let numExportedTabs = 0;

		for (const tab of tabs) {
			const { title, url } = tab;


			if (excludedLinks.find(link => {
				return url.includes(link)
			})) {
				console.log(`URL is excluded: ${url}`);
				continue;
			}

			if (doesUrlExist(app, url)) {
				console.log(`URL already exists in vault: ${url}`);
				continue;
			}

			const titlePipeline = pipeline(formatForFileSystem, removeWebsiteTitles, removeTrailingHyphen, removeTrailingPeriod);
			const titleString = (titlePipeline(title) as string).trim();

			const websiteTitle = getWebsiteTitle(url);
			const trimmed = trimForObsidian(titleString as string, websiteTitle, "md");

			const sentenceCase = toSentenceCase(trimmed);
			const titleWithWebsite = appendWebsiteTitle(sentenceCase, websiteTitle);

			const fileName = `${titleWithWebsite}.md`;

			const filePath = `${vaultSavePath}/${fileName}`;
			const data = generateFrontmatter(urlFrontmatterKey, url);

			const result = await createFile(
				app,
				filePath,
				data
			);
			if (result)
				numExportedTabs++;
		}
		new Notice(
			`Exported ${numExportedTabs} remote browser tabs from ${remoteBrowserAppName}`
		);
	} catch (err) {
		console.error(err);
		new Notice(`Error exporting browser tabs: ${err.message} `);
	}
};
