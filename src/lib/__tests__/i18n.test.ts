import { describe, expect, it } from 'vitest'
import { formatDate, t } from '../i18n'

describe('t', () => {
	it('localizes series labels', () => {
		expect(t('en').seriesPart(2)).toBe('Part 2')
		expect(t('zh-CN').seriesPart(2)).toBe('第 2 篇')
		expect(t('en').seriesPartOf(1, 3)).toBe('Part 1 of 3')
		expect(t('zh-CN').seriesPartOf(1, 3)).toBe('第 1 篇，共 3 篇')
	})

	it('localizes the table of contents title', () => {
		expect(t('en').toc).toBe('Table of Contents')
		expect(t('zh-CN').toc).toBe('目录')
	})

	it('falls back to English for a missing language', () => {
		expect(t(undefined).toc).toBe('Table of Contents')
	})
})

describe('formatDate', () => {
	const date = new Date('2026-10-11T00:00:00Z')

	it('uses the short English form by default', () => {
		expect(formatDate(date)).toBe('Oct 11, 2026')
	})

	it('uses the Chinese year-month-day form for zh-CN', () => {
		expect(formatDate(date, 'zh-CN')).toBe('2026年10月11日')
	})
})
