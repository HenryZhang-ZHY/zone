import { describe, expect, it } from 'vitest'
import { alternateLinks, groupTranslations, localizeSeries, resolvePost, translationKey } from '../localized'

const original = (id: string, lang: 'en' | 'zh-Hans', updatedDate?: Date) => ({
	id,
	data: { lang, title: `${id} title`, description: `${id} description`, pubDate: new Date('2026-01-01'), updatedDate },
})

const translation = (id: string, translatedAt = new Date('2026-02-01')) => ({
	id,
	data: { title: `${id} title`, description: `${id} description`, translatedAt },
})

describe('translationKey', () => {
	it('splits a translation id into post slug and locale', () => {
		expect(translationKey('refuge/ja')).toEqual({ slug: 'refuge', locale: 'ja' })
		expect(translationKey('refuge/zh-Hans')).toEqual({ slug: 'refuge', locale: 'zh-Hans' })
	})

	it('rejects a file named after an unsupported language', () => {
		expect(() => translationKey('refuge/jp')).toThrow(/jp/)
	})
})

describe('groupTranslations', () => {
	const originals = [original('refuge', 'zh-Hans'), original('how-to-fix-a-bug', 'en')]

	it('groups translations by the post they translate', () => {
		const grouped = groupTranslations(originals, [translation('refuge/ja'), translation('refuge/en')])
		expect([...grouped.get('refuge')!.keys()]).toEqual(['ja', 'en'])
		expect(grouped.get('how-to-fix-a-bug')).toBeUndefined()
	})

	it('rejects a translation into the original language', () => {
		expect(() => groupTranslations(originals, [translation('refuge/zh-Hans')])).toThrow(/refuge.*zh-Hans/)
	})

	it('rejects a translation without an original', () => {
		expect(() => groupTranslations(originals, [translation('missing/ja')])).toThrow(/missing/)
	})
})

describe('resolvePost', () => {
	const post = original('refuge', 'zh-Hans')
	const translations = groupTranslations([post], [translation('refuge/ja'), translation('refuge/en')]).get('refuge')

	it('shows the original in its own language', () => {
		const resolved = resolvePost(post, translations, 'zh-Hans')
		expect(resolved).toMatchObject({ contentLang: 'zh-Hans', sourceLocale: 'zh-Hans', isFallback: false, title: 'refuge title' })
		expect(resolved.translation).toBeUndefined()
	})

	it('shows a translation when the reader language has one', () => {
		const resolved = resolvePost(post, translations, 'ja')
		expect(resolved).toMatchObject({ contentLang: 'ja', isFallback: false, outdated: false, title: 'refuge/ja title' })
		expect(resolved.translation?.id).toBe('refuge/ja')
	})

	it('falls back to the original when the reader language has none', () => {
		const resolved = resolvePost(post, translations, 'de')
		expect(resolved).toMatchObject({ locale: 'de', contentLang: 'zh-Hans', isFallback: true, title: 'refuge title' })
	})

	it('lists the languages the post exists in, in switcher order', () => {
		expect(resolvePost(post, translations, 'de').available).toEqual(['en', 'ja', 'zh-Hans'])
		expect(resolvePost(post, undefined, 'de').available).toEqual(['zh-Hans'])
	})

	it('flags a translation made before the original last changed', () => {
		const updated = original('refuge', 'zh-Hans', new Date('2026-03-01'))
		expect(resolvePost(updated, translations, 'ja').outdated).toBe(true)
		expect(resolvePost(updated, translations, 'zh-Hans').outdated).toBe(false)
	})
})

describe('localizeSeries', () => {
	const series = {
		id: 'handbook',
		data: { title: '手册', description: '中文简介', lang: 'zh-Hans' as const, translations: { en: { title: 'Handbook', description: 'English blurb' } } },
	}

	it('uses the translated title and description when present', () => {
		expect(localizeSeries(series, 'en')).toEqual({ title: 'Handbook', description: 'English blurb', lang: 'en' })
	})

	it('falls back to the original otherwise', () => {
		expect(localizeSeries(series, 'fr')).toEqual({ title: '手册', description: '中文简介', lang: 'zh-Hans' })
	})
})

describe('alternateLinks', () => {
	const site = 'https://shuzhi.zone'

	it('links every available language and points x-default at the original', () => {
		expect(alternateLinks('/blog/refuge/', ['en', 'zh-Hans'], 'zh-Hans', site)).toEqual([
			{ hreflang: 'en', href: 'https://shuzhi.zone/en/blog/refuge/' },
			{ hreflang: 'zh-Hans', href: 'https://shuzhi.zone/zh-hans/blog/refuge/' },
			{ hreflang: 'x-default', href: 'https://shuzhi.zone/zh-hans/blog/refuge/' },
		])
	})

	it('can point x-default at another URL such as the language picker', () => {
		expect(alternateLinks('/', ['en'], '/', site).at(-1)).toEqual({ hreflang: 'x-default', href: 'https://shuzhi.zone/' })
	})
})
