import { describe, expect, it } from 'vitest'
import { formatDate, languageName, t } from '../index'
import { locales } from '../locales'

describe('t', () => {
	it('localizes series labels', () => {
		expect(t('en').seriesPart(2)).toBe('Part 2')
		expect(t('zh-Hans').seriesPart(2)).toBe('第 2 篇')
		expect(t('en').seriesPartOf(1, 3)).toBe('Part 1 of 3')
		expect(t('zh-Hans').seriesPartOf(1, 3)).toBe('第 1 篇，共 3 篇')
	})

	it('has every message for every locale', () => {
		const keys = Object.keys(t('en')).sort()
		for (const { tag } of locales) expect(Object.keys(t(tag)).sort()).toEqual(keys)
	})

	it('names languages in the reader language', () => {
		expect(languageName('zh-Hans', 'en')).toBe('Simplified Chinese')
		expect(languageName('en', 'ja')).toBe('英語')
	})

	it('builds the language note from the source language', () => {
		expect(t('en').original).toBe('Original')
		expect(t('en').translatedFrom('简体中文')).toBe('Translated from 简体中文')
		expect(t('en').readIn('简体中文')).toBe('Read in 简体中文')
		expect(t('zh-Hans').original).toBe('原文')
		expect(t('zh-Hans').translatedFrom('English')).toBe('译自English')
	})
})

describe('formatDate', () => {
	const date = new Date('2026-10-11T00:00:00Z')

	it('uses the short English form', () => {
		expect(formatDate(date, 'en')).toBe('Oct 11, 2026')
	})

	it('uses the year-month-day form for Chinese and Japanese', () => {
		expect(formatDate(date, 'zh-Hans')).toBe('2026年10月11日')
		expect(formatDate(date, 'ja')).toBe('2026年10月11日')
	})

	it('formats in UTC so the date never shifts', () => {
		expect(formatDate(new Date('2026-10-11T23:30:00Z'), 'de')).toBe('11. Okt. 2026')
	})
})
