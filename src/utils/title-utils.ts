/**
 * Removes and/or replaces any characters that are not allowed in a file name
 * @param value - The title to format
 */
export const formatStringForFileSystem = (value: string) => {
	// Replace colon with hyphen
	value = value.replace(/:/g, "-");
	// Replace bach slash with space
	value = value.replace(/\\/g, " ");
	// Replace forward slash with space
	value = value.replace(/\//g, " ");
	// Replace carrot with nothing
	value = value.replace(/\^/g, "");
	// Replace left bracket with nothing
	value = value.replace(/\[/g, "");
	// Replace right bracket with nothing
	value = value.replace(/\]/g, "");
	// Replace hash tag with nothing
	value = value.replace(/#/g, "");
	// Replace pipe with nothing
	value = value.replace(/\|/g, "");
	return value;
}

export const removeQuotations = (value: string) => {
	//Replace double quotation mark with nothing
	value = value.replace(/"/g, "");
	//Replace single quotation mark with nothing
	value = value.replace(/'/g, "");
	return value;
}

/**
 * Removes website titles from the end of a string
 * @param value - The title to format
 */
export const removeWebsiteTitles = (value: string) => {
	value = value.replace(/- YouTube$/, "");
	value = value.replace(/- Search X$/, "");
	value = value.replace(/ X$/, "");
	value = value.trim();
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
	const MAX_LENGTH_MAC_OS = 255;
	return value.substring(0, MAX_LENGTH_MAC_OS - extension.length - 1);
}
