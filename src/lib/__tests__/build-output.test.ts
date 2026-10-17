import { describe, expect, it } from 'vitest'
import { legacyRedirects, readHeadLinks, sitemapXml, type BuiltPage } from '../build-output'

const site = 'https://shuzhi.zone'

const head = (canonical: string, alternates: [string, string][]) =>
	`<html><head><link rel="canonical" href="${site}${canonical}">` +
	alternates.map(([lang, path]) => `<link rel="alternate" hreflang="${lang}" href="${site}${path}">`).join('') +
	`<link rel="alternate" type="application/rss+xml" title="x" href="${site}/en/rss.xml"></head></html>`

describe('readHeadLinks', () => {
	it('reads the canonical URL and the hreflang alternates, ignoring feeds', () => {
		const html = head('/zh-hans/blog/refuge/', [['zh-Hans', '/zh-hans/blog/refuge/'], ['x-default', '/zh-hans/blog/refuge/']])
		expect(readHeadLinks(html)).toEqual({
			canonical: `${site}/zh-hans/blog/refuge/`,
			alternates: [
				{ hreflang: 'zh-Hans', href: `${site}/zh-hans/blog/refuge/` },
				{ hreflang: 'x-default', href: `${site}/zh-hans/blog/refuge/` },
			],
		})
	})
})

const page = (url: string, canonical: string, alternates: [string, string][]): BuiltPage => ({
	url: `${site}${url}`,
	canonical: `${site}${canonical}`,
	alternates: alternates.map(([hreflang, path]) => ({ hreflang, href: `${site}${path}` })),
})

const pages = [
	page('/', '/', [['en', '/en/'], ['x-default', '/']]),
	page('/en/', '/en/', [['en', '/en/'], ['ja', '/ja/'], ['x-default', '/']]),
	page('/ja/', '/ja/', [['en', '/en/'], ['ja', '/ja/'], ['x-default', '/']]),
	page('/en/blog/refuge/', '/en/blog/refuge/', [['en', '/en/blog/refuge/'], ['zh-Hans', '/zh-hans/blog/refuge/'], ['x-default', '/zh-hans/blog/refuge/']]),
	page('/ja/blog/refuge/', '/zh-hans/blog/refuge/', [['en', '/en/blog/refuge/'], ['zh-Hans', '/zh-hans/blog/refuge/'], ['x-default', '/zh-hans/blog/refuge/']]),
	page('/zh-hans/blog/refuge/', '/zh-hans/blog/refuge/', [['en', '/en/blog/refuge/'], ['zh-Hans', '/zh-hans/blog/refuge/'], ['x-default', '/zh-hans/blog/refuge/']]),
	page('/en/reading/', '/en/reading/', [['en', '/en/reading/'], ['x-default', '/en/reading/']]),
	page('/en/d-sibs/', '/zh-hans/d-sibs/', [['zh-Hans', '/zh-hans/d-sibs/'], ['x-default', '/zh-hans/d-sibs/']]),
]

describe('sitemapXml', () => {
	const xml = sitemapXml(pages)

	it('lists only pages that are their own canonical', () => {
		expect(xml).toContain(`<loc>${site}/ja/</loc>`)
		expect(xml).not.toContain(`<loc>${site}/</loc>`)
		expect(xml).toContain(`<loc>${site}/en/blog/refuge/</loc>`)
		expect(xml).not.toContain(`<loc>${site}/ja/blog/refuge/</loc>`)
		expect(xml).not.toContain(`<loc>${site}/en/d-sibs/</loc>`)
	})

	it('gives each entry its language alternates', () => {
		expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="zh-Hans" href="${site}/zh-hans/blog/refuge/"/>`)
		expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
	})
})

describe('legacyRedirects', () => {
	it('sends each pre-locale URL to the version that was there before: the original', () => {
		expect(legacyRedirects(pages)).toEqual([
			'/blog/refuge/ /zh-hans/blog/refuge/ 301',
			'/reading/ /en/reading/ 301',
			'/d-sibs/ /zh-hans/d-sibs/ 301',
		])
	})
})
