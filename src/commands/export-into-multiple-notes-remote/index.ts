import { App, Command, Notice } from "obsidian";
import { createFileByParts, createFolder } from "src/utils/file-utils";
import { generateFrontmatter } from "src/utils/frontmatter-utils";
import { appendWebsiteTitle, getWebsiteTitle, removeTrailingHyphen, removeTrailingPeriod, removeWebsiteTitles, trimForObsidian } from "src/utils/title-utils";
import { PluginSettings } from "src/types";
import { pipeline } from "src/utils/pipeline";
import { formatForFileSystem } from "src/utils/file-system-utils";
import { decodeHtmlEntities, toSentenceCase } from "src/utils/string-utils";
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
	const { vaultSavePath, remoteBrowserAppName, urlFrontmatterKey, excludedLinks, adbPath } = settings;
	try {
		await createFolder(app, vaultSavePath);
		const tabs = await exportRemoteTabs(
			remoteBrowserAppName,
			adbPath
		);
		console.log(`Found ${tabs.length} remote browser tabs`);

		let numExportedTabs = 0;
		let numExcludedTabs = 0;
		let numAlreadyExistingTabs = 0;

		for (const tab of tabs) {
			const { title, url } = tab;


			if (excludedLinks.find(link => {
				return url.includes(link)
			})) {
				console.log(`URL is excluded: ${url}`);
				numExcludedTabs++;
				continue;
			}

			if (doesUrlExist(app, url)) {
				console.log(`URL already exists in vault: ${url}`);
				numAlreadyExistingTabs++;
				continue;
			}

			const titlePipeline = pipeline(decodeHtmlEntities, formatForFileSystem, removeWebsiteTitles, removeTrailingHyphen, removeTrailingPeriod);
			const titleString = (titlePipeline(title) as string).trim();

			const websiteTitle = getWebsiteTitle(url);
			const trimmed = trimForObsidian(titleString as string, websiteTitle, "md");

			const sentenceCase = toSentenceCase(trimmed);
			const titleWithWebsite = appendWebsiteTitle(sentenceCase, websiteTitle);

			const data = generateFrontmatter(urlFrontmatterKey, url);

			await createFileByParts(
				app,
				vaultSavePath,
				titleWithWebsite,
				"md",
				data
			);
			numExportedTabs++;
		}
		new Notice(
			`Exported ${numExportedTabs} remote browser tabs from ${remoteBrowserAppName}`
		);
		console.log(`Exported ${numExportedTabs} remote browser tabs`);
		console.log(`Excluded ${numExcludedTabs} remote browser tabs`);
		console.log(`Skipped ${numAlreadyExistingTabs} remote browser tabs`);
	} catch (err) {
		console.error(err);
		new Notice(`Error exporting browser tabs: ${err.message} `);
	}
};
