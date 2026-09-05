export const trimForFileSystem = (value: string, extension: string) => {
	const MAX_LENGTH = 255;
	return value.substring(0, MAX_LENGTH - extension.length).trim();
};

export const removeNotificationCount = (value: string) => {
	return value.replace(/^\(\d\)/, "").trim();
};

export const getEmptyTabTitle = () => {
	return `Untitled tab ${crypto.randomUUID()}`;
};

/**
 * Names the nth attempt at a file: "Title", "Title (Duplicate)", "Title (Duplicate 2)", ...
 * The title is trimmed so the suffix and extension still fit the file system limit.
 * @param title - The tab title, already formatted for the file system
 * @param attempt - 0 for the original name, then one higher per collision
 * @param extension - The file extension, without a leading dot
 */
export const withDuplicateSuffix = (
	title: string,
	attempt: number,
	extension: string
) => {
	if (attempt === 0) {
		return trimForFileSystem(title, `.${extension}`);
	}
	const suffix = attempt === 1 ? " (Duplicate)" : ` (Duplicate ${attempt})`;
	return trimForFileSystem(title, `${suffix}.${extension}`) + suffix;
};
