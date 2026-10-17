import { describe, expect, it } from 'vitest'
import { localeFromSegment, locales, localeStaticPaths, localizePath, negotiateLocale, ogLocale, segmentOf, splitLocale, switchLocale } from '../locales'

describe('locales', () => {
	it('lists the supported BCP 47 tags in switcher order', () => {
		expect(locales.map((l) => l.tag)).toEqual(['en', 'es', 'de', 'ja', 'fr', 'pt', 'ru', 'zh-Hans'])
	})

	it('names every language in that language', () => {
		expect(Object.fromEntries(locales.map((l) => [l.tag, l.name]))).toEqual({
			en: 'English',
			es: 'Español',
			de: 'Deutsch',
			ja: '日本語',
			fr: 'Français',
			pt: 'Português',
			ru: 'Русский',
			'zh-Hans': '简体中文',
		})
	})

	it('uses lowercase tags as URL segments', () => {
		expect(segmentOf('zh-Hans')).toBe('zh-hans')
		expect(segmentOf('en')).toBe('en')
		expect(localeFromSegment('zh-hans')).toBe('zh-Hans')
		expect(localeFromSegment('zh-Hans')).toBeUndefined()
		expect(localeFromSegment('blog')).toBeUndefined()
	})
})

describe('localeStaticPaths', () => {
	it('gives one route per locale with the tag as a prop', () => {
		expect(localeStaticPaths().at(-1)).toEqual({ params: { locale: 'zh-hans' }, props: { locale: 'zh-Hans' } })
		expect(localeStaticPaths()).toHaveLength(8)
	})
})

describe('localizePath', () => {
	it('prefixes a site path with the locale segment', () => {
		expect(localizePath('/', 'ja')).toBe('/ja/')
		expect(localizePath('/blog/refuge/', 'zh-Hans')).toBe('/zh-hans/blog/refuge/')
		expect(localizePath('/rss.xml', 'en')).toBe('/en/rss.xml')
	})

	it('keeps query strings and fragments', () => {
		expect(localizePath('/blog/x/#notes', 'de')).toBe('/de/blog/x/#notes')
	})
})

describe('splitLocale', () => {
	it('separates the locale from the site path', () => {
		expect(splitLocale('/zh-hans/blog/refuge/')).toEqual({ locale: 'zh-Hans', path: '/blog/refuge/' })
		expect(splitLocale('/en/')).toEqual({ locale: 'en', path: '/' })
		expect(splitLocale('/ja')).toEqual({ locale: 'ja', path: '/' })
	})

	it('leaves unprefixed paths alone', () => {
		expect(splitLocale('/blog/refuge/')).toEqual({ locale: undefined, path: '/blog/refuge/' })
		expect(splitLocale('/')).toEqual({ locale: undefined, path: '/' })
	})
})

describe('switchLocale', () => {
	it('points the current page at another language', () => {
		expect(switchLocale('/ja/series/household-asset-allocation/', 'fr')).toBe('/fr/series/household-asset-allocation/')
		expect(switchLocale('/zh-hans/', 'en')).toBe('/en/')
	})
})

describe('negotiateLocale', () => {
	it('prefers a valid saved choice over the browser languages', () => {
		expect(negotiateLocale('en-US,en;q=0.9', 'ja')).toBe('ja')
		expect(negotiateLocale('en-US', 'klingon')).toBe('en')
	})

	it('matches region variants on language and script', () => {
		expect(negotiateLocale('zh-CN,zh;q=0.9')).toBe('zh-Hans')
		expect(negotiateLocale('zh-SG')).toBe('zh-Hans')
		expect(negotiateLocale('pt-BR')).toBe('pt')
		expect(negotiateLocale('de-AT,de;q=0.8')).toBe('de')
	})

	it('does not serve Simplified Chinese to Traditional Chinese readers', () => {
		expect(negotiateLocale('zh-TW,ja;q=0.5')).toBe('ja')
		expect(negotiateLocale('zh-Hant')).toBe('en')
		expect(negotiateLocale('zh-HK')).toBe('en')
	})

	it('follows q-values rather than header order', () => {
		expect(negotiateLocale('fr;q=0.3,ru;q=0.9')).toBe('ru')
		expect(negotiateLocale('es;q=0,de')).toBe('de')
	})

	it('falls back to English', () => {
		expect(negotiateLocale(null)).toBe('en')
		expect(negotiateLocale('')).toBe('en')
		expect(negotiateLocale('ko-KR,*;q=0.1')).toBe('en')
		expect(negotiateLocale('not a tag!!')).toBe('en')
	})
})

describe('ogLocale', () => {
	it('maps tags to the Open Graph language_TERRITORY form', () => {
		expect(ogLocale('en')).toBe('en_US')
		expect(ogLocale('pt')).toBe('pt_BR')
		expect(ogLocale('zh-Hans')).toBe('zh_CN')
		expect(ogLocale('ja')).toBe('ja_JP')
	})
})
