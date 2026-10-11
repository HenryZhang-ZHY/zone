import { describe, expect, it } from 'vitest'
import { getSeriesNav, getSeriesPosts } from '../series'

const post = (id: string, seriesId?: string, seriesOrder?: number) => ({
	id,
	data: { title: id, series: seriesId ? { id: seriesId } : undefined, seriesOrder },
})

const posts = [
	post('third', 'handbook', 3),
	post('standalone'),
	post('first', 'handbook', 1),
	post('other', 'another', 1),
	post('second', 'handbook', 2),
]

describe('getSeriesPosts', () => {
	it('returns only posts in the series, ordered by seriesOrder', () => {
		expect(getSeriesPosts(posts, 'handbook').map((p) => p.id)).toEqual(['first', 'second', 'third'])
	})

	it('rejects duplicate seriesOrder values', () => {
		expect(() => getSeriesPosts([post('a', 's', 1), post('b', 's', 1)], 's')).toThrow(/duplicate seriesOrder 1/)
	})
})

describe('getSeriesNav', () => {
	it('gives position and neighbours within the series', () => {
		const nav = getSeriesNav(posts, posts[4])!
		expect(nav.position).toBe(2)
		expect(nav.total).toBe(3)
		expect(nav.prev?.id).toBe('first')
		expect(nav.next?.id).toBe('third')
	})

	it('has no prev on the first post and no next on the last', () => {
		expect(getSeriesNav(posts, posts[2])!.prev).toBeUndefined()
		expect(getSeriesNav(posts, posts[0])!.next).toBeUndefined()
	})

	it('returns undefined for posts outside any series', () => {
		expect(getSeriesNav(posts, posts[1])).toBeUndefined()
	})
})
