import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const read = (...segments: string[]) => readFileSync(resolve(root, ...segments), 'utf8')

describe('page-to-page layout', () => {
	it('uses one centered reading measure for the archive and the article', () => {
		const home = read('src', 'pages', '[locale]', 'index.astro')
		expect(home).toContain('max-w-reading')
		expect(home).toContain('Entry')

		const article = read('src', 'layouts', 'BlogPost.astro')
		expect(article).toContain('max-w-reading')
		expect(article).toContain('z-prose')
		expect(article).toContain('EdgeToc')
		expect(article).not.toContain('toc-desktop')
		expect(article).not.toContain('grid-template-columns')
	})

	it('keeps the 78ch reading measure in the theme and the tokens', () => {
		const css = read('packages', 'ui', 'src', 'styles', 'index.css')
		expect(css).toContain('@utility shell')
		expect(css).toContain('--container-reading')

		const tokens = read('packages', 'tokens', 'tokens.json')
		expect(tokens).toContain('"reading": "78ch"')
		expect(tokens).toContain('"reading-22"')
	})

	it('removes the page cross-fade for reduced motion', () => {
		const base = read('packages', 'ui', 'src', 'styles', 'base.css')
		expect(base).toContain('@view-transition')
		expect(base).toContain('navigation: auto')
		expect(base).toMatch(/prefers-reduced-motion:\s*reduce/)
		expect(base).toContain('animation: none')
	})
})
