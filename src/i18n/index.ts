import type { Locale } from './locales'
import de from './messages/de'
import en, { type Messages } from './messages/en'
import es from './messages/es'
import fr from './messages/fr'
import ja from './messages/ja'
import pt from './messages/pt'
import ru from './messages/ru'
import zhHans from './messages/zh-Hans'

export * from './locales'
export type { Messages }

const messages: Record<Locale, Messages> = { en, es, de, ja, fr, pt, ru, 'zh-Hans': zhHans }

export const t = (locale: Locale): Messages => messages[locale]

/** A language's name in the reader's language, e.g. `Simplified Chinese` for an English reader. */
export const languageName = (language: Locale, reader: Locale) =>
	new Intl.DisplayNames([reader], { type: 'language' }).of(language) ?? language

export const formatDate = (date: Date, locale: Locale) =>
	date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
