/**
 * Supported languages as BCP 47 tags. Tags stay as short as the distinction needs
 * (W3C language-tag guidance): plain language subtags, plus the `Hans` script subtag
 * because Simplified Chinese differs from Traditional by script, not by region.
 * URLs use the lowercase form of the tag; markup, hreflang and Intl use the tag itself.
 */
export const locales = [
	{ tag: 'en', name: 'English', og: 'en_US' },
	{ tag: 'es', name: 'Español', og: 'es_ES' },
	{ tag: 'de', name: 'Deutsch', og: 'de_DE' },
	{ tag: 'ja', name: '日本語', og: 'ja_JP' },
	{ tag: 'fr', name: 'Français', og: 'fr_FR' },
	{ tag: 'pt', name: 'Português', og: 'pt_BR' },
	{ tag: 'ru', name: 'Русский', og: 'ru_RU' },
	{ tag: 'zh-Hans', name: '简体中文', og: 'zh_CN' },
] as const

export type Locale = (typeof locales)[number]['tag']

export const defaultLocale: Locale = 'en'

export const localeTags: Locale[] = locales.map((l) => l.tag)

export const LOCALE_COOKIE = 'lang'

export const isLocale = (value: unknown): value is Locale => localeTags.includes(value as Locale)

export const segmentOf = (locale: Locale) => locale.toLowerCase()

export const localeFromSegment = (segment: string | undefined): Locale | undefined =>
	localeTags.find((tag) => segmentOf(tag) === segment)

/** Endonym: the language's name for itself, e.g. `日本語`. */
export const endonym = (locale: Locale) => locales.find((l) => l.tag === locale)!.name

export const ogLocale = (locale: Locale) => locales.find((l) => l.tag === locale)!.og

/** Turns a site path such as `/blog/x/` into its URL in one language, `/ja/blog/x/`. */
export const localizePath = (path: string, locale: Locale) => `/${segmentOf(locale)}${path.startsWith('/') ? path : `/${path}`}`

/** Splits a URL path into its locale and the site path after it. */
export function splitLocale(pathname: string): { locale: Locale | undefined; path: string } {
	const match = pathname.match(/^\/([^/]+)(\/.*)?$/)
	const locale = localeFromSegment(match?.[1])
	if (!locale) return { locale: undefined, path: pathname }
	return { locale, path: match?.[2] ?? '/' }
}

/** `getStaticPaths` entries for a page that exists under every locale. */
export const localeStaticPaths = () => localeTags.map((locale) => ({ params: { locale: segmentOf(locale) }, props: { locale } }))

export const switchLocale = (pathname: string, locale: Locale) => localizePath(splitLocale(pathname).path, locale)

const languageAndScript = (tag: string) => {
	const { language, script } = new Intl.Locale(tag).maximize()
	return `${language}-${script}`
}

const supportedByScript = new Map(localeTags.map((tag) => [languageAndScript(tag), tag]))

/**
 * Picks the language for a visitor: a saved choice wins, then the browser's
 * Accept-Language entries by q-value. Each entry is matched on language and script,
 * so zh-CN and zh-SG reach zh-Hans while zh-TW and zh-HK do not.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined, saved?: string | null): Locale {
	if (isLocale(saved)) return saved

	const ranges = (acceptLanguage ?? '')
		.split(',')
		.map((part, index) => {
			const [range, ...params] = part.trim().split(';')
			const q = params.map((p) => p.trim().match(/^q=([\d.]+)$/)?.[1]).find(Boolean)
			return { range: range.trim(), q: q === undefined ? 1 : Number(q), index }
		})
		.filter((r) => r.range && r.range !== '*' && r.q > 0)
		.sort((a, b) => b.q - a.q || a.index - b.index)

	for (const { range } of ranges) {
		try {
			const match = supportedByScript.get(languageAndScript(range))
			if (match) return match
		} catch {
			// Not a well-formed language tag; try the next one.
		}
	}
	return defaultLocale
}
