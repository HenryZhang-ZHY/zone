import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

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

	it('opens listening with the same head and the episode row', () => {
		const listening = pages('listening.astro')
		expect(listening).toContain('RunningHead')
		expect(listening).toContain('EpisodeRow')
		expect(listening).toContain('title={episode.data.ogTitle}')
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

describe('the listening row leads with the channel', () => {
	it('carries a channel, its cover and the lines kept from the episode', () => {
		const config = read('src', 'content.config.ts')
		const podcast = config.slice(config.indexOf('const podcast'))
		expect(podcast).toContain('show: z.string()')
		expect(podcast).toContain('showCover: z.url()')
		expect(podcast).toContain('notes: z')
	})

	it('passes the channel, the cover and the lines into the row, in file order', () => {
		const listening = read('src', 'pages', '[locale]', 'listening.astro')
		expect(listening).toContain('show={episode.data.show}')
		expect(listening).toContain('cover={episode.data.showCover}')
		expect(listening).toContain('notes={episode.data.notes}')
		expect(listening).toContain('sortByOrder')
	})

	it('keeps the episode number inside the title, as published', () => {
		const listening = read('src', 'pages', '[locale]', 'listening.astro')
		expect(listening).toContain('title={episode.data.ogTitle}')
		expect(listening).not.toContain('splitEpisodeCode')
	})

	it('stores one image per row and no audio', () => {
		const config = read('src', 'content.config.ts')
		const podcast = config.slice(config.indexOf('const podcast'))
		expect(podcast).not.toContain('ogAudio')
		expect(podcast).not.toContain('ogImage')
		expect(read('src', 'content', 'podcast.yaml')).not.toMatch(/^\s*(ogAudio|ogImage):/m)
	})
})

describe('the episode row is the cover, the channel, the title, then the lines', () => {
	const row = () => ui('components', 'EpisodeRow.astro')

	it('draws them in that order', () => {
		const file = row()
		const order = ['styles.cover()', 'styles.channel()', 'styles.title()', 'styles.notes()'].map((slot) =>
			file.indexOf(slot),
		)
		expect(order).not.toContain(-1)
		expect([...order].sort((a, b) => a - b)).toEqual(order)
	})

	it('keeps the cover at 56px, the square the channel and title sit beside', () => {
		expect(row()).toContain('size-14')
	})

	it('holds no fill and no timestamp column', () => {
		const file = row()
		expect(file).not.toContain('bg-surface')
		expect(file).not.toContain('grid-cols-')
	})

	it('keeps the time at the end of the line, never starting one of its own', () => {
		const file = row()
		expect(file).toContain('\\u2060')
		expect(file).toContain('whitespace-nowrap')
	})

	it('lets a line stand without a time, and lets a row hold more than one', () => {
		const file = row()
		expect(file).toContain('at?: string')
		expect(file).toContain('.map(')
	})
})

describe('a kept line keeps its time a time', () => {
	it('only accepts an `at` the player would show', () => {
		const stamp = /^\d{1,2}:\d{2}(:\d{2})?$/
		const episodes = parse(read('src', 'content', 'podcast.yaml')) as {
			notes?: { at?: string; text: string }[]
		}[]
		for (const line of episodes.flatMap((episode) => episode.notes ?? [])) {
			expect(line.text.length).toBeGreaterThan(0)
			if (line.at) expect(line.at).toMatch(stamp)
		}
	})
})
