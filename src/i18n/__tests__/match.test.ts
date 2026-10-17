import { describe, expect, it } from 'vitest'
import { rankLocales, suggestLocale } from '../match'
import { localeTags } from '../locales'

describe('rankLocales', () => {
	it('keeps the reader order and drops unsupported or repeated languages', () => {
		expect(rankLocales(['ko-KR', 'ja-JP', 'ja', 'zh-CN', 'en-US'], localeTags, false)).toEqual(['ja', 'zh-Hans', 'en'])
	})

	it('matches Traditional Chinese only when lenient', () => {
		expect(rankLocales(['zh-TW'], localeTags, false)).toEqual([])
		expect(rankLocales(['zh-TW', 'zh-HK'], localeTags, true)).toEqual(['zh-Hans'])
	})

	it('skips tags that are not well formed', () => {
		expect(rankLocales(['*', 'not a tag!!', 'fr'], localeTags, false)).toEqual(['fr'])
	})
})

describe('suggestLocale', () => {
	const base = { supported: localeTags, current: 'en', available: localeTags as string[], languages: [] as string[] }

	it('suggests the reader language when the page exists in it', () => {
		expect(suggestLocale({ ...base, languages: ['zh-CN'] })).toBe('zh-Hans')
	})

	it('suggests nothing when the reader is already in their first choice', () => {
		expect(suggestLocale({ ...base, languages: ['en-US', 'zh-CN'] })).toBeUndefined()
	})

	it('suggests nothing when the page has no version in the reader language', () => {
		expect(suggestLocale({ ...base, available: ['en'], languages: ['zh-CN'] })).toBeUndefined()
	})

	it('falls through to the next language the reader ranks above the current one', () => {
		expect(suggestLocale({ ...base, available: ['en', 'zh-Hans'], languages: ['ja', 'zh-CN', 'en'] })).toBe('zh-Hans')
		expect(suggestLocale({ ...base, current: 'zh-Hans', available: ['en', 'zh-Hans'], languages: ['ja', 'zh-CN', 'en'] })).toBeUndefined()
	})

	it('puts a saved choice before the browser languages', () => {
		expect(suggestLocale({ ...base, current: 'zh-Hans', saved: 'en', languages: ['zh-CN'] })).toBe('en')
	})

	it('ignores a saved value that is not a supported language', () => {
		expect(suggestLocale({ ...base, current: 'ja', saved: 'xx', languages: ['ja'] })).toBeUndefined()
	})

	it('offers Simplified Chinese to Traditional Chinese readers', () => {
		expect(suggestLocale({ ...base, languages: ['zh-TW'] })).toBe('zh-Hans')
	})

	it('suggests nothing to readers whose languages are all unsupported', () => {
		expect(suggestLocale({ ...base, current: 'zh-Hans', languages: ['ko-KR'] })).toBeUndefined()
	})
})
