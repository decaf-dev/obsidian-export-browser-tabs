import { request } from "http";
import { getEmptyTabTitle } from "src/utils/title-utils";
import { RemoteExportError } from "./errors";
import { BrowserTab } from "./types";
import { filterDuplicateTabs } from "./utils";

/**
 * Fetches the DevTools target list over the adb port forward.
 *
 * 127.0.0.1 is used rather than localhost on purpose: localhost can resolve to ::1
 * first, and adb only listens on IPv4, which fails in a way that is hard to diagnose.
 * @throws RemoteExportError if the browser cannot be reached or does not answer with JSON
 * @param port - The local port that adb forwarded
 * @param timeoutMs - How long to wait for the browser to answer
 * @param appName - The configured remote browser application name, used in messages
 */
export const fetchDevToolsTargets = (
	port: number,
	timeoutMs: number,
	appName: string
): Promise<unknown> => {
	return new Promise<unknown>((resolve, reject) => {
		let isSettled = false;
		let timer: ReturnType<typeof setTimeout> | null = null;

		const settle = (err: RemoteExportError | null, value?: unknown) => {
			if (isSettled) return;
			isSettled = true;
			if (timer !== null) clearTimeout(timer);
			if (err !== null) {
				reject(err);
			} else {
				resolve(value);
			}
		};

		const connectionRefused = (detail?: string) =>
			new RemoteExportError(
				"DEVTOOLS_CONNECTION_REFUSED",
				`${appName} is not accepting debug connections. Make sure it is open on the device, then try again.`,
				detail
			);

		const req = request(
			{
				host: "127.0.0.1",
				port,
				path: "/json/list",
				method: "GET",
			},
			(res) => {
				const status = res.statusCode ?? 0;
				const chunks: Buffer[] = [];

				res.on("data", (chunk: Buffer) => chunks.push(chunk));
				res.on("end", () => {
					const body = Buffer.concat(chunks).toString("utf8");

					if (status < 200 || status >= 300) {
						settle(
							new RemoteExportError(
								"DEVTOOLS_BAD_STATUS",
								`The device returned HTTP ${status} when listing tabs. See the developer console for details.`,
								body
							)
						);
						return;
					}

					if (body.trim() === "") {
						settle(connectionRefused());
						return;
					}

					try {
						settle(null, JSON.parse(body));
					} catch {
						settle(
							new RemoteExportError(
								"DEVTOOLS_INVALID_RESPONSE",
								`Could not read the tab list from ${appName}. See the developer console for details.`,
								body.slice(0, 200)
							)
						);
					}
				});
			}
		);

		//An own timer rather than the socket timeout option: a browser that accepts the
		//connection and then never answers must not be able to hang the export, and the
		//socket timeout does not reliably cover that case.
		timer = setTimeout(() => {
			settle(
				new RemoteExportError(
					"DEVTOOLS_TIMEOUT",
					`${appName} did not respond within ${Math.round(
						timeoutMs / 1000
					)} seconds. Try again.`
				)
			);
			req.destroy();
		}, timeoutMs);

		req.on("error", (err) => settle(connectionRefused(err.message)));

		req.end();
	});
};

const isPageUrl = (url: string): boolean => {
	//Excludes chrome://, chrome-native://, devtools:// and about:blank
	return url.startsWith("http://") || url.startsWith("https://");
};

/**
 * Turns a DevTools target list into browser tabs, discarding anything that is not a
 * real page. Nothing in the payload is trusted: it comes from another device.
 * @throws RemoteExportError if the payload is not a list of targets
 * @param payload - The parsed JSON body of /json/list
 */
export const parseDevToolsTargets = (payload: unknown): BrowserTab[] => {
	if (!Array.isArray(payload)) {
		throw new RemoteExportError(
			"DEVTOOLS_INVALID_RESPONSE",
			"Could not read the tab list from the device. See the developer console for details.",
			JSON.stringify(payload).slice(0, 200)
		);
	}

	let numSkipped = 0;

	const tabs: BrowserTab[] = [];
	for (const entry of payload) {
		if (typeof entry !== "object" || entry === null) {
			numSkipped++;
			continue;
		}

		const { url, title, type } = entry as {
			url?: unknown;
			title?: unknown;
			type?: unknown;
		};

		//Service workers, background pages and iframes are targets too, but they
		//are not tabs anyone wants a note for
		if (typeof type === "string" && type !== "page") {
			numSkipped++;
			continue;
		}

		if (typeof url !== "string" || !isPageUrl(url)) {
			numSkipped++;
			continue;
		}

		//The title is empty while a tab is still loading
		const hasTitle = typeof title === "string" && title.trim() !== "";
		tabs.push({ url, title: hasTitle ? title : getEmptyTabTitle() });
	}

	if (numSkipped > 0) {
		console.log(`Skipped ${numSkipped} DevTools targets that were not pages`);
	}

	//Deduplicate after filtering so the count is not inflated by discarded targets
	return filterDuplicateTabs(tabs);
};
