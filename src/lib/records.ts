/** Helpers for the two record pages: what a link points at, and the code a podcast prepends to its titles. */

/** `E96.用3张表…` → `{ code: 'E96', title: '用3张表…' }`. A code needs a separator, so `2024 年的…` stays whole. */
export const splitEpisodeCode = (title: string): { code: string; title: string } => {
	const match = title.match(/^\s*((?:E)?\d{1,4})\s*[.:：、]\s*(.+)$/i)
	if (!match) return { code: '', title }
	return { code: match[1].toUpperCase(), title: match[2] }
}

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
