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
	value = value.replace(/YouTube$/, "");
	value = value.replace(/Search X$/, "");
	value = value.replace(/Wikipedia$/, "");
	value = value.replace(/Amazon$/, "");
	value = value.replace(/Medium$/, "");
	value = value.replace(/GitHub$/, "");
	value = value.replace(/Instagram$/, "");
	value = value.replace(/Pintrest$/, "");
	value = value.replace(/X$/, "");
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

export const trimForObsidian = (value: string, websiteTitle: string, extension: string) => {
	const MAX_LENGTH = 150;
	return value.substring(0, MAX_LENGTH - websiteTitle.length - 1 - extension.length - 1);
}

export const getWebsiteTitle = (url: string) => {
	if (url.includes("youtube.com")) {
		return "YouTube";
	} else if (url.includes("x.com") || (url.includes("twitter.com"))) {
		return "X";
	} else if (url.includes("instagram.com")) {
		return "Instagram";
	} else if (url.includes("pintrest.com")) {
		return "Pintrest";
	} else if (url.includes("github.com")) {
		return "GitHub";
	} else if (url.includes("medium.com")) {
		return "Medium";
	} else if (url.includes("wikipedia.com")) {
		return "Wikipedia";
	} else if (url.includes("amazon.com")) {
		return "Amazon";
	} else {
		return "Website"
	}
}

export const appendWebsiteTitle = (value: string, websiteTitle: string) => {
	return `${value} (${websiteTitle})`;
}
