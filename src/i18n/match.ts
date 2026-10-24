/*
 * Language matching shared by the Worker and the in-page language suggestion.
 * Both functions are serialized into an inline script (see LanguageNote.astro),
 * so each must be self-contained: no imports, no references outside its own body.
 */

/**
 * The supported locales a reader accepts, best first. Tags are matched on language
 * and script, so zh-CN and zh-SG reach zh-Hans. Traditional Chinese (zh-TW, zh-HK)
 * reaches zh-Hans only when `lenient`: fine to offer, wrong to impose.
 */
export function rankLocales(languages: readonly string[], supported: readonly string[], lenient: boolean): string[] {
	const key = (tag: string) => {
		try {
			const { language, script } = new Intl.Locale(tag).maximize()
			return `${language}-${script}`
		} catch {
			return undefined
		}
	}
	const byKey = new Map(supported.map((tag) => [key(tag), tag]))
	const ranked: string[] = []
	for (const tag of languages) {
		let match = byKey.get(key(tag))
		if (!match && lenient && key(tag) === 'zh-Hant') match = byKey.get('zh-Hans')
		if (match && !ranked.includes(match)) ranked.push(match)
	}
	return ranked
}

export interface SuggestionInput {
	/** Language saved by an explicit choice, if any. */
	saved?: string | null
	/** The browser's languages, best first (`navigator.languages`). */
	languages: readonly string[]
	current: string
	/** Languages the page really exists in. */
	available: readonly string[]
	supported: readonly string[]
}

/**
 * A language worth suggesting on this page: the reader's best-ranked language that
 * the page exists in, as long as the reader ranks it above the current one.
 */
export function suggestLocale({ saved, languages, current, available, supported }: SuggestionInput): string | undefined {
	const preferred = rankLocales(saved && supported.includes(saved) ? [saved, ...languages] : languages, supported, true)
	for (const locale of preferred) {
		if (locale === current) return undefined
		if (available.includes(locale)) return locale
	}
	return undefined
}
