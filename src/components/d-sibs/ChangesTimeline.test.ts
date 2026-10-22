import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./ChangesTimeline.astro', import.meta.url), 'utf8')

describe('ChangesTimeline register', () => {
	it('uses a hairline timeline instead of a set of cards', () => {
		expect(source).toContain('w-px bg-line')
		expect(source).toContain('-translate-x-1/2')
		expect(source).not.toContain('border-radius')
		expect(source).not.toContain('box-shadow')
		expect(source).toContain('GroupMark')
	})

	it('keeps change counts neutral and uses the group palette only', () => {
		expect(source).not.toContain('text-positive')
		expect(source).not.toContain('text-danger')
		expect(source).not.toContain('z-tag')
		expect(source).toContain('tabular-nums')
	})
})
