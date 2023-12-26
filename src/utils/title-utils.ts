export const removeQuotations = (value: string) => {
	//Replace double quotation mark with nothing
	value = value.replace(/"/g, "");
	//Replace single quotation mark with nothing
	value = value.replace(/'/g, "");
	return value;
}

export const removeTrailingPeriod = (value: string) => {
	return value.replace(/\.$/, "");
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
