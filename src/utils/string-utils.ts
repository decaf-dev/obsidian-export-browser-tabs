export const decodeHtmlEntities = (value: string) => {
	var textarea = document.createElement("textarea");
	textarea.innerHTML = value;
	return textarea.value;
};

export const removeQueryParams = (value: string) => {
	return value.replace(/\?.*$/, "");
};
