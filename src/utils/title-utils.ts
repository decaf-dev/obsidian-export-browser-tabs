export const removeQuotations = (value: string) => {
	//Replace double quotation mark with nothing
	value = value.replace(/"/g, "");
	//Replace single quotation mark with nothing
	value = value.replace(/'/g, "");
	return value;
}

/**
 * Finds the longest string in a string that is separated by a hyphen space `- ` or space hyphen ` -`
 * @param value - The value to format
 */
export const findLongestString = (value: string) => {
	const parts = value.split(/ -|- /);

	let title = "";
	for (const part of parts) {
		const trimmedPart = part.trim();
		if (title.length < trimmedPart.length) {
			title = trimmedPart;
		}
	}
	return title;
}

export const trimForFileSystem = (value: string, extension: string) => {
	const MAX_LENGTH = 255;
	return value.substring(0, MAX_LENGTH - extension.length).trim();
}

export const removeNotificationCount = (value: string) => {
	return value.replace(/^\(\d\)/, "").trim();
}

export const getEmptyTabTitle = () => {
	return `Untitled tab ${crypto.randomUUID()}`;
}
