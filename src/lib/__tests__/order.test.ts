import { describe, expect, it } from 'vitest'
import { sortByOrder } from '../order'

const entry = (id: string, order: number) => ({ id, data: { order } })

describe('sortByOrder', () => {
	it('puts entries back in the order the YAML array had', () => {
		const sorted = sortByOrder([entry('c', 2), entry('a', 0), entry('b', 1)])
		expect(sorted.map((item) => item.id)).toEqual(['a', 'b', 'c'])
	})

	it('leaves the collection it was given alone', () => {
		const entries = [entry('c', 2), entry('a', 0)]
		sortByOrder(entries)
		expect(entries.map((item) => item.id)).toEqual(['c', 'a'])
	})
})
