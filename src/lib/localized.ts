import { isLocale, localeTags, localizePath, type Locale } from '../i18n'

export interface OriginalLike {
	id: string
	data: { lang: Locale; title: string; description: string; pubDate: Date; updatedDate?: Date }
}

export interface TranslationLike {
	id: string
	data: { title: string; description: string; translatedAt: Date }
}

export interface ResolvedPost<T extends TranslationLike> {
	/** Language of the page chrome, taken from the URL. */
	locale: Locale
	/** Language the body is shown in: the reader's when a translation exists, the original's otherwise. */
	contentLang: Locale
	sourceLocale: Locale
	title: string
	description: string
	translation?: T
	isFallback: boolean
	/** The original changed after this translation was made. */
	outdated: boolean
	/** Languages the post exists in, in switcher order. */
	available: Locale[]
}

/** Translation ids are `<slug>/<locale>`, taken from `blog/<slug>/<locale>.md`. */
export function translationKey(id: string): { slug: string; locale: Locale } {
	const [slug, locale] = id.split('/')
	if (!isLocale(locale)) throw new Error(`Translation "${id}" is named after an unsupported language "${locale}"; use one of ${localeTags.join(', ')}`)
	return { slug, locale }
}

export function groupTranslations<T extends TranslationLike>(originals: OriginalLike[], translations: T[]): Map<string, Map<Locale, T>> {
	const sourceOf = new Map(originals.map((post) => [post.id, post.data.lang]))
	const grouped = new Map<string, Map<Locale, T>>()
	for (const translation of translations) {
		const { slug, locale } = translationKey(translation.id)
		const source = sourceOf.get(slug)
		if (!source) throw new Error(`Translation "${translation.id}" has no original at blog/${slug}/index.md`)
		if (source === locale) throw new Error(`Translation "${translation.id}" is in ${locale}, the language of the original "${slug}"`)
		if (!grouped.has(slug)) grouped.set(slug, new Map())
		grouped.get(slug)!.set(locale, translation)
	}
	return grouped
}

export function resolvePost<T extends TranslationLike>(post: OriginalLike, translations: Map<Locale, T> | undefined, locale: Locale): ResolvedPost<T> {
	const sourceLocale = post.data.lang
	const translation = locale === sourceLocale ? undefined : translations?.get(locale)
	const contentLang = translation ? locale : sourceLocale
	const lastChanged = post.data.updatedDate ?? post.data.pubDate
	return {
		locale,
		contentLang,
		sourceLocale,
		title: translation?.data.title ?? post.data.title,
		description: translation?.data.description ?? post.data.description,
		translation,
		isFallback: contentLang !== locale,
		outdated: translation !== undefined && translation.data.translatedAt < lastChanged,
		available: localeTags.filter((tag) => tag === sourceLocale || translations?.has(tag)),
	}
}

export interface SeriesLike {
	id: string
	data: { title: string; description: string; lang: Locale; translations?: Partial<Record<Locale, { title: string; description: string }>> }
}

export function localizeSeries(series: SeriesLike, locale: Locale): { title: string; description: string; lang: Locale } {
	const translated = series.data.translations?.[locale]
	if (translated) return { ...translated, lang: locale }
	return { title: series.data.title, description: series.data.description, lang: series.data.lang }
}

export interface AlternateLink {
	hreflang: string
	href: string
}

/**
 * hreflang links for one site path: one per language the page really exists in,
 * plus x-default, which points at a locale's version or at a URL such as `/`.
 */
export function alternateLinks(path: string, available: Locale[], xDefault: Locale | string, site: string | URL): AlternateLink[] {
	const absolute = (href: string) => new URL(href, site).href
	return [
		...available.map((locale) => ({ hreflang: locale, href: absolute(localizePath(path, locale)) })),
		{ hreflang: 'x-default', href: absolute(isLocale(xDefault) ? localizePath(path, xDefault) : xDefault) },
	]
}
