import { App, normalizePath } from "obsidian";
import { withDuplicateSuffix } from "src/utils/title-utils";

/** Guards against an unbounded loop if `create` keeps reporting a collision */
const MAX_DUPLICATE_ATTEMPTS = 100;

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
 * Creates a file, falling back to "<name> (Duplicate)", "<name> (Duplicate 2)", ...
 * when the name is already taken. The path will be normalized.
 * @throws If the file cannot be created for any reason other than a name collision
 * @param app - The Obsidian app object
 * @param savePath - The folder to create the file in
 * @param fileName - The desired file name, without an extension
 * @param extension - The file extension, without a leading dot
 * @param data - The data to write to the file
 * @returns The file name that was actually used, so the caller can report renames
 */
export const createFileWithUniqueName = async (
	app: App,
	savePath: string,
	fileName: string,
	extension: string,
	data: string
): Promise<string> => {
	for (let attempt = 0; attempt <= MAX_DUPLICATE_ATTEMPTS; attempt++) {
		const name = withDuplicateSuffix(fileName, attempt, extension);
		try {
			const filePath = normalizePath(`${savePath}/${name}.${extension}`);
			await app.vault.create(filePath, data);
			return name;
		} catch (err) {
			if (!err.message.includes("already exists")) {
				throw err;
			}
		}
	}
	throw new Error(
		`Could not find an available name for: ${fileName}.${extension}`
	);
}
