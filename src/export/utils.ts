import { BrowserTab } from "./types";

export const filterDuplicateTabs = (tabs: BrowserTab[]): BrowserTab[] => {
	const urls: string[] = [];
	return tabs.filter((tab) => {
		const { url } = tab;
		if (urls.includes(url)) {
			return false;
		}
		urls.push(url);
		return true;
	});
}
