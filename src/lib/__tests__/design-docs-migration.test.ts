import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const read = (...segments: string[]) => readFileSync(resolve(root, ...segments), 'utf8')

describe('design documentation after the live migration', () => {
	it('retires the alpha notes and points at Hairline', () => {
		const pointer = read('DESIGN.md')
		expect(pointer).toContain('design/README.md')
		expect(existsSync(resolve(root, 'DESIGN.dark.md'))).toBe(false)

		const readme = read('design', 'README.md')
		expect(readme).toContain('@zone/ui')
	})

	it('records the live reading measure and the selected mark', () => {
		const decision = read('design', 'decisions', '0003-reading-measure.md')
		expect(decision).toContain('78ch')
		expect(decision).toMatch(/22px|22/)
		expect(decision).toContain('reading-22')

		const marks = read('apps', 'design', 'src', 'pages', 'marks.astro')
		expect(marks).toContain('41 is selected')

		const favicon = read('public', 'favicon.svg')
		expect(favicon).toContain('<svg')
		expect(favicon).toContain('M10.7 30')
	})
})
