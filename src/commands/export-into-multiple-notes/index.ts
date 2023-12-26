import { App, Command, Notice } from "obsidian";
import { exportBrowserTabs } from "src/export/export";
import { createFile, createFolder } from "src/utils/file-utils";
import { generateFrontmatter } from "src/utils/frontmatter-utils";
import { appendWebsiteTitle, getWebsiteTitle, removeTrailingHyphen, removeTrailingPeriod, removeWebsiteTitles, trimForObsidian } from "src/utils/title-utils";
import { PluginSettings } from "src/types";
import { pipeline } from "src/utils/pipeline";
import { formatForFileSystem } from "src/utils/file-system-utils";
import { toSentenceCase } from "src/utils/string-utils";
import { doesUrlExist } from "src/utils/vault";

export const exportIntoMultipleNotesCommand = (
	app: App,
	settings: PluginSettings
): Command => {
	return {
		id: "export-into-multiple-notes",
		name: "Export into multiple notes",
		callback: callback(app, settings),
	};
};

const callback = (app: App, settings: PluginSettings) => async () => {
	const { vaultSavePath, browserApplicationName, urlFrontmatterKey, excludedLinks } = settings;
	try {
		await createFolder(app, vaultSavePath);
		const tabs = await exportBrowserTabs(
			browserApplicationName
		);
		console.log(`Found ${tabs.length} browser tabs`);

		let numExportedTabs = 0;

		for (const tab of tabs) {
			const { title, url } = tab;

			const titlePipeline = pipeline(formatForFileSystem, removeWebsiteTitles, removeTrailingHyphen, removeTrailingPeriod);
			const titleString = (titlePipeline(title) as string).trim();

			const websiteTitle = getWebsiteTitle(url);
			const trimmed = trimForObsidian(titleString as string, websiteTitle, "md");

			const sentenceCase = toSentenceCase(trimmed);
			const titleWithWebsite = appendWebsiteTitle(sentenceCase, websiteTitle);

			const fileName = `${titleWithWebsite}.md`;

			const filePath = `${vaultSavePath}/${fileName}`;
			const data = generateFrontmatter(urlFrontmatterKey, url);

			if (doesUrlExist(app, url)) {
				console.log(`URL already exists in vault: ${url}`);
				continue;
			}

			if (excludedLinks.find(excluded => {
				const { url: excludedUrl } = excluded;
				return url.includes(excludedUrl)
			})) {
				continue;
			}

			await createFile(
				app,
				filePath,
				data
			);
			numExportedTabs++;
		}
		new Notice(
			`Exported ${numExportedTabs} browser tabs from ${browserApplicationName}`
		);
	} catch (err) {
		console.error(err);
		new Notice(`Error exporting browser tabs: ${err.message} `);
	}
};
