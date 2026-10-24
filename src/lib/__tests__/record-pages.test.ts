import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const read = (...segments: string[]) => readFileSync(resolve(root, ...segments), 'utf8')
const ui = (...segments: string[]) => read('packages', 'ui', 'src', ...segments)

describe('the footer is the sitemap', () => {
	it('leaves the header with the wordmark and the language menu', () => {
		const header = ui('components', 'SiteHeader.astro')
		expect(header).toContain('items = []')
		expect(header).not.toContain("{ label: 'Reading', href: '/reading/' }")
	})

	it('lists the record pages, not the language row, in the footer', () => {
		const layout = read('src', 'layouts', 'BaseLayout.astro')
		expect(layout).toContain("href('/reading/')")
		expect(layout).toContain("href('/listening/')")
		expect(layout).toContain("href('/reading/books/')")
		expect(layout).not.toContain('LanguageIndex')
	})
})

describe('the record pages share one running head and one row', () => {
	const pages = (name: string) => read('src', 'pages', '[locale]', name)

	it('opens reading with a running head and dated rows', () => {
		const reading = pages('reading.astro')
		expect(reading).toContain('RunningHead')
		expect(reading).toContain('RecordRow')
		expect(reading).not.toContain('PageHeader')
		expect(reading).not.toContain('books/')
	})

	it('opens listening with the same head and drops the player', () => {
		const listening = pages('listening.astro')
		expect(listening).toContain('RunningHead')
		expect(listening).toContain('RecordRow')
		expect(listening).toContain('splitEpisodeCode')
		expect(listening).not.toContain('AudioPlayer')
		expect(listening).not.toContain('PageHeader')
	})

	it('opens the shelf with the same head, without a subtitle', () => {
		const books = pages('reading/books.astro')
		expect(books).toContain('RunningHead')
		expect(books).not.toContain('PageHeader')
		expect(books).not.toContain('booksSubtitle')
	})
})

describe('page top depends on what the page opens with', () => {
	it('gives lists a smaller top than the article', () => {
		const tokens = JSON.parse(read('packages', 'tokens', 'tokens.json'))
		expect(tokens.layout['page-top']).toBe('clamp(2rem, 4vw, 2.5rem)')
		expect(tokens.layout['article-top']).toBe('clamp(2.5rem, 5vw, 4rem)')

		const article = read('src', 'layouts', 'BlogPost.astro')
		expect(article).toContain('pt-article-top')
	})
})

describe('the YAML array order survives Astro', () => {
	it('stamps the array index on ordered data files', () => {
		const config = read('src', 'content.config.ts')
		expect(config).toContain('orderedFile')
		expect(config).toContain('order: z.number().int()')
	})

	it('sorts the shelf by the order the file was written in', () => {
		expect(read('src', 'pages', '[locale]', 'reading/books.astro')).toContain('sortByOrder')
	})

	it('sorts the listening list the same way', () => {
		expect(read('src', 'pages', '[locale]', 'listening.astro')).toContain('sortByOrder')
	})
})

describe('the listening row names its channel', () => {
	it('carries a channel and its cover in the data', () => {
		const config = read('src', 'content.config.ts')
		expect(config).toContain('show: z.string()')
		expect(config).toContain('showCover: z.url()')
	})

	it('passes the cover and the channel into the row, in file order', () => {
		const listening = read('src', 'pages', '[locale]', 'listening.astro')
		expect(listening).toContain('cover={episode.data.showCover}')
		expect(listening).toContain('meta={episode.data.show}')
		expect(listening).toContain('sortByOrder')
	})

	it('renders a cover only when the row has one', () => {
		const row = ui('components', 'RecordRow.astro')
		expect(row).toContain('cover &&')
	})
})
