import { describe, expect, it } from 'vitest'
import { linkHost, sourceLabel } from '../records'

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
