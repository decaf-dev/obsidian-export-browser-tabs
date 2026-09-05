import { App, Command, Notice } from "obsidian";
import { RemoteExportError, getErrorMessage } from "src/export/errors";
import { exportRemoteTabs } from "src/export/remote-export";
import { PluginSettings } from "src/types";
import { formatForFileSystem } from "src/utils/file-system-utils";
import { createFileWithUniqueName, createFolder } from "src/utils/file-utils";
import { generateFrontmatter } from "src/utils/frontmatter-utils";
import { pipeline } from "src/utils/pipeline";
import { decodeHtmlEntities } from "src/utils/string-utils";
import {
	removeNotificationCount,
	trimForFileSystem,
} from "src/utils/title-utils";
import { getFrontmatterUrl } from "src/utils/vault";

/** Running two exports at once would let one tear down the other's port forward */
let isExporting = false;

const NOTICE_ERROR_DURATION_MS = 10_000;

export const exportRemoteCommand = (
	app: App,
	settings: PluginSettings
): Command => {
	return {
		id: "export-remote",
		name: "Export (remote)",
		callback: callback(app, settings),
	};
};

/**
 * Collects every URL already saved in the vault.
 * Built once per export - checking each tab against every file would be quadratic
 * and freeze the UI on a large vault.
 * @param app - The Obsidian app object
 */
const getExistingUrls = (app: App): Set<string> => {
	const urls = new Set<string>();
	for (const file of app.vault.getMarkdownFiles()) {
		const url = getFrontmatterUrl(app, file);
		if (url !== undefined) {
			urls.add(url);
		}
	}
	return urls;
};

const callback = (app: App, settings: PluginSettings) => async () => {
	const {
		saveFolder,
		remoteBrowserAppName,
		urlProperty: urlFrontmatterKey,
		excludedLinks,
		adbPath,
	} = settings;

	if (isExporting) {
		new Notice("A remote export is already running.");
		return;
	}
	isExporting = true;

	try {
		if (saveFolder === "") {
			throw new RemoteExportError(
				"MISSING_SAVE_FOLDER",
				"No save folder specified. Please set one in the plugin settings."
			);
		}

		new Notice("Exporting remote browser tabs...");

		await createFolder(app, saveFolder);
		const tabs = await exportRemoteTabs(remoteBrowserAppName, adbPath);
		console.log(`Found ${tabs.length} remote browser tabs`);

		if (tabs.length === 0) {
			new Notice(`No open tabs found in ${remoteBrowserAppName}.`);
			return;
		}

		const existingUrls = getExistingUrls(app);

		let numExportedTabs = 0;
		let numSkippedTabs = 0;
		let numRenamedTabs = 0;
		let numFailedTabs = 0;

		for (const tab of tabs) {
			const { title, url } = tab;

			try {
				if (excludedLinks.find((link) => url.includes(link))) {
					console.log(`URL is excluded: ${url}`);
					numSkippedTabs++;
					continue;
				}

				if (existingUrls.has(url)) {
					console.log(`URL already exists in vault: ${url}`);
					numSkippedTabs++;
					continue;
				}

				const titlePipeline = pipeline(
					decodeHtmlEntities,
					formatForFileSystem,
					removeNotificationCount
				);
				const formattedTitle = titlePipeline(title) as string;
				const trimmedTitle = trimForFileSystem(formattedTitle, ".md");
				const data = generateFrontmatter(urlFrontmatterKey, url);

				const createdName = await createFileWithUniqueName(
					app,
					saveFolder,
					trimmedTitle,
					"md",
					data
				);
				//A name collision appends "(Duplicate)", which the user would
				//otherwise have no way of knowing about
				if (createdName !== trimmedTitle) {
					numRenamedTabs++;
				}

				existingUrls.add(url);
				numExportedTabs++;
			} catch (err) {
				console.error(err);
				numFailedTabs++;
			}
		}

		const details = [
			numSkippedTabs > 0 ? `${numSkippedTabs} skipped` : null,
			numRenamedTabs > 0 ? `${numRenamedTabs} renamed` : null,
			numFailedTabs > 0 ? `${numFailedTabs} failed` : null,
		].filter((detail) => detail !== null);

		const message = `Export complete: ${numExportedTabs} tabs exported from ${remoteBrowserAppName}${
			details.length > 0 ? `, ${details.join(", ")}` : ""
		}`;
		new Notice(message);
		console.log(message);
	} catch (err) {
		console.error(err);
		if (err instanceof RemoteExportError && err.detail !== undefined) {
			console.error(err.detail);
		}
		new Notice(getErrorMessage(err), NOTICE_ERROR_DURATION_MS);
	} finally {
		isExporting = false;
	}
};
