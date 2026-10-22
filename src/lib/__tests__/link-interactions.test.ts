import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const readUi = (...segments: string[]) => readFileSync(resolve(root, 'packages', 'ui', 'src', ...segments), 'utf8')

describe('link interaction taxonomy', () => {
	it('keeps the live wordmark domain-only', () => {
		const wordmark = readUi('components', 'Wordmark.astro')
		expect(wordmark).toContain("defaultVariants: { variant: 'plain' }")
		expect(wordmark).not.toContain('BranchMark')
		expect(wordmark).toContain('hover:text-accent')
	})

	it('makes entry titles explicit content links on hover and focus', () => {
		const entry = readUi('components', 'Entry.astro')
		expect(entry).toContain('font-prose')
		expect(entry).toContain('group-hover:text-accent')
		expect(entry).toContain('group-focus-visible:text-accent')
		expect(entry).toContain('group-hover:decoration-current')
	})

	it('uses a fixed edge index with labels on hover or focus', () => {
		const edge = readUi('components', 'EdgeToc.astro')
		expect(edge).toContain('data-edge-tick')
		expect(edge).toContain('data-edge-link')
		expect(edge).toContain('group-hover/toc:visible')
		expect(edge).toContain('group-focus-within/toc:visible')
		expect(edge).toContain('aria-label')
	})
})
