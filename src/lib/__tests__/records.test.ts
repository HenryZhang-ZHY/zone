import { describe, expect, it } from 'vitest'
import { linkHost, sourceLabel, splitEpisodeCode } from '../records'

describe('splitEpisodeCode', () => {
	it('moves a leading episode code out of the title', () => {
		expect(splitEpisodeCode('E96.用3张表的思路看待家庭财务：管钱，易如反掌！')).toEqual({
			code: 'E96',
			title: '用3张表的思路看待家庭财务：管钱，易如反掌！',
		})
		expect(splitEpisodeCode('101. 对 YouWare 创始人明超平 3 小时访谈')).toEqual({
			code: '101',
			title: '对 YouWare 创始人明超平 3 小时访谈',
		})
		expect(splitEpisodeCode('118: 天生卷王郭人杰')).toEqual({ code: '118', title: '天生卷王郭人杰' })
	})

	it('keeps a title that carries no code', () => {
		expect(splitEpisodeCode('《一如既往》：历史不会重复')).toEqual({ code: '', title: '《一如既往》：历史不会重复' })
	})

	it('does not strip a leading number that is part of the title', () => {
		expect(splitEpisodeCode('2024 年的三件事')).toEqual({ code: '', title: '2024 年的三件事' })
	})
})

describe('linkHost', () => {
	it('returns the bare domain of a link', () => {
		expect(linkHost('https://web.stanford.edu/~jdlevin/Papers/Lemons.pdf')).toBe('web.stanford.edu')
		expect(linkHost('https://blog.solazy.me/20260515/')).toBe('blog.solazy.me')
	})

	it('drops the www prefix', () => {
		expect(linkHost('https://www.xiaoyuzhoufm.com/episode/67b4abe6606e5c5940544785')).toBe('xiaoyuzhoufm.com')
	})

	it('returns an empty string for a value that is not a URL', () => {
		expect(linkHost('not a url')).toBe('')
	})
})

describe('sourceLabel', () => {
	it('names a host the site knows', () => {
		expect(sourceLabel('xiaoyuzhoufm.com')).toBe('小宇宙')
	})

	it('falls back to the host', () => {
		expect(sourceLabel('web.stanford.edu')).toBe('web.stanford.edu')
	})
})
