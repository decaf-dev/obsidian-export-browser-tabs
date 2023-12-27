import { App, Notice, normalizePath } from "obsidian";

/**
 * Creates a folder if it doesn't already exist
 * @throws If the folder cannot be created, but only if it doesn't already exist
 * @param app - The Obsidian app object
 * @param folderPath - The path to the folder to create
 */
export const createFolder = async (app: App, folderPath: string) => {
	try {
		await app.vault.createFolder(folderPath);
	} catch (err) {
		if (err.message.includes("already exists")) {
			return;
		}
		throw err;
	}
}

/**
 * Creates a file. The path will be normalized.
 * @param app - The Obsidian app object
 * @param filePath - The path to the file to create
 * @param data - The data to write to the file
 */
export const createFile = async (
	app: App,
	filePath: string,
	data: string
) => {
	try {
		const normalizedFilePath = normalizePath(filePath);
		await app.vault.create(normalizedFilePath, data);
	} catch (err) {
		if (err.message.includes("already exists")) {
			throw new Error(`File already exists in vault: ${filePath}`);
		}
		throw err;
	}
}

/**
 * Creates a file. The path will be normalized.
 * @param app - The Obsidian app object
 * @param filePath - The path to the file to create
 * @param data - The data to write to the file
 */
export const createFileByParts = async (
	app: App,
	savePath: string,
	fileName: string,
	extension: string,
	data: string
) => {
	const filePath = `${savePath}/${fileName}.${extension}`;
	try {
		const normalizedFilePath = normalizePath(filePath);
		await app.vault.create(normalizedFilePath, data);
	} catch (err) {
		if (err.message.includes("already exists")) {
			console.log("File already exists in vault:", filePath);
			const newFilePath = `${savePath}/Tab conflict ${Date.now()}.${extension}`;
			createFile(app, newFilePath, data);
			return;
		}
		throw err;
	}
}

