export const decodeHtmlEntities = (value: string) => {
	var textarea = document.createElement('textarea');
	textarea.innerHTML = value;
	return textarea.value;
}
