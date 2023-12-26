/**
 * Removes and/or replaces any characters that are not allowed in a file name
 * @param value - The title to format
 */
export const formatForFileSystem = (value: string) => {
	return formatForMacOS(value);
}

export const trimForFileSystem = (value: string, extension: string) => {
	return trimForMacOS(value, extension);
}

const formatForMacOS = (value: string) => {
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

const trimForMacOS = (value: string, extension: string) => {
	const MAX_LENGTH_MAC_OS = 255;
	return value.substring(0, MAX_LENGTH_MAC_OS - extension.length - 1);
}
