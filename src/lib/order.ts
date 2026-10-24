/**
 * Astro keys a `file()` collection by entry id and sorts it by id, so the order of
 * the YAML array is lost by the time a page calls `getCollection`. The data files
 * are ordered on purpose — the shelf is ordered by importance, not by date — so the
 * loader in `content.config.ts` stamps each entry with its array index and pages
 * sort by it.
 */
export const sortByOrder = <T extends { data: { order: number } }>(entries: T[]): T[] =>
	[...entries].sort((a, b) => a.data.order - b.data.order)
