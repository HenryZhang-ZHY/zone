/** What a record row's link points at. */
/** The domain a link points at, without `www.`. Empty when the value is not a URL. */
export const linkHost = (url: string): string => {
	try {
		return new URL(url).hostname.replace(/^www\./, '')
	} catch {
		return ''
	}
}

/** Hosts that read better by name than by domain. */
const SOURCE_LABELS: Record<string, string> = {
	'xiaoyuzhoufm.com': '小宇宙',
}

export const sourceLabel = (host: string): string => SOURCE_LABELS[host] ?? host
