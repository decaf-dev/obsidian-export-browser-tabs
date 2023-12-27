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
		let numEmptyTabs = 0;
		let numTabConflicts = 0;
		let numSkipped = 0;

		for (const tab of tabs) {
			const { title, url } = tab;

			if (url === "") {
				numEmptyTabs++;
				numSkipped++;
				continue;
			}

			if (excludedLinks.find(link => {
				return url.includes(link)
			})) {
				// console.log(`URL is excluded: ${url}`);
				numExcludedTabs++;
				numSkipped++;
				continue;
			}

			if (doesUrlExist(app, url)) {
				// console.log(`URL already exists in vault: ${url}`);
				numAlreadyExistingTabs++;
				numSkipped++;
				continue;
			}

			const titlePipeline = pipeline(decodeHtmlEntities, formatForFileSystem, removeWebsiteTitles, removeTrailingHyphen, removeTrailingPeriod);
			const titleString = (titlePipeline(title) as string).trim();

			const websiteTitle = getWebsiteTitle(url);
			const trimmed = trimForObsidian(titleString as string, websiteTitle, "md");

			const sentenceCase = toSentenceCase(trimmed);
			const titleWithWebsite = appendWebsiteTitle(sentenceCase, websiteTitle);

			const data = generateFrontmatter(urlFrontmatterKey, url);

			const result = await createFileByParts(
				app,
				vaultSavePath,
				titleWithWebsite,
				"md",
				data
			);
			if (!result) {
				numTabConflicts++;
			}
			numExportedTabs++;
		}
		new Notice(
			`Exported ${numExportedTabs} remote browser tabs from ${remoteBrowserAppName}`
		);
		console.log("-----");
		console.log(`Empty url: ${numEmptyTabs}`);
		console.log(`Excluded: ${numExcludedTabs}`);
		console.log(`Already existing url: ${numAlreadyExistingTabs}`);
		console.log(`Title conflict: ${numTabConflicts}`);
		console.log("-----");
		console.log(`Skipped: ${numSkipped}`);
		console.log(`Exported: ${numExportedTabs}`);
		console.log("-----");
		console.log("");
	} catch (err) {
		console.error(err);
		new Notice(`Error exporting browser tabs: ${err.message} `);
	}
};
