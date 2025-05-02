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
