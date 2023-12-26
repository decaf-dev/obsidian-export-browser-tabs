/**
 * Removes and/or replaces any characters that are not allowed in a file name
 * @param value - The title to format
 */
export const formatStringForFileSystem = (value: string) => {
	let title = value;

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

	//Only allow 255 characters
	title = title.substring(0, 255);
	return title;
}
