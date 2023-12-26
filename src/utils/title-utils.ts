/**
 * Removes and/or replaces any characters that are not allowed in a file name
 * @param value - The title to format
 */
export const formatStringForFileSystem = (value: string) => {
	let title = value;

	// Trim whitespace
	title = title.trim();
	// Replace colon with hyphen
	title = title.replace(/:/g, "-");
	// Replace bach slash with space
	title = title.replace(/\\/g, " ");
	// Replace forward slash with space
	title = title.replace(/\//g, " ");
	// Replace carrot with nothing
	title = title.replace(/\^/g, "");
	// Replace left bracket with nothing
	title = title.replace(/\[/g, "");
	// Replace right bracket with nothing
	title = title.replace(/\]/g, "");
	// Replace hash tag with nothing
	title = title.replace(/#/g, "");
	// Replace pipe with nothing
	title = title.replace(/\|/g, "");
	//Replace double quotation mark with nothing
	title = title.replace(/"/g, "");
	//Replace single quotation mark with nothing
	title = title.replace(/'/g, "");

	//Replace `| text` with nothing
	//Replace `- YouTube with nothing`
	return title;
}

export const trimForFileSystem = (value: string, extension: string) => {
	const MAX_LENGTH_MAC_OS = 255;
	return value.substring(0, MAX_LENGTH_MAC_OS - extension.length - 1);
}
