import type { AlternateLink } from './localized'

/** What a built page declares about its languages, read back from its HTML. */
export interface BuiltPage {
	url: string
	canonical?: string
	alternates: AlternateLink[]
}

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]

export function readHeadLinks(html: string): Omit<BuiltPage, 'url'> {
	const links = html.match(/<link\b[^>]*>/g) ?? []
	const canonical = links.find((tag) => attr(tag, 'rel') === 'canonical')
	const alternates = links.flatMap((tag) => {
		const hreflang = attr(tag, 'hreflang')
		const href = attr(tag, 'href')
		return attr(tag, 'rel') === 'alternate' && hreflang && href ? [{ hreflang, href }] : []
	})
	return { canonical: canonical && attr(canonical, 'href'), alternates }
}

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/**
 * A sitemap of the pages that are their own canonical, each with its hreflang
 * alternates. The root is left out: it redirects to a language.
 */
export function sitemapXml(pages: BuiltPage[]): string {
	const entries = pages
		.filter((page) => page.canonical === page.url && new URL(page.url).pathname !== '/')
		.sort((a, b) => a.url.localeCompare(b.url))
		.map((page) => {
			const links = page.alternates.map((alt) => `<xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}"/>`)
			return `<url><loc>${escapeXml(page.url)}</loc>${links.join('')}</url>`
		})
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`
}

/**
 * Cloudflare `_redirects` lines from the URLs that existed before locale prefixes.
 * The English build of every page knows its x-default, which is the original:
 * the language the old unprefixed URL served.
 */
export function legacyRedirects(pages: BuiltPage[]): string[] {
	return pages.flatMap((page) => {
		const { pathname } = new URL(page.url)
		const legacy = pathname.match(/^\/en(\/.+)$/)?.[1]
		const xDefault = page.alternates.find((alt) => alt.hreflang === 'x-default')
		if (!legacy || legacy === '/' || !xDefault) return []
		return [`${legacy} ${new URL(xDefault.href).pathname} 301`]
	})
}
