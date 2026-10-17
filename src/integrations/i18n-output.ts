import { appendFile, readFile, writeFile } from 'node:fs/promises'
import type { AstroIntegration } from 'astro'
import { legacyRedirects, readHeadLinks, sitemapXml, type BuiltPage } from '../lib/build-output'

/**
 * After the build, reads every page's canonical and hreflang links and writes
 * `sitemap.xml` plus the 301s from pre-locale URLs into `_redirects`. The pages
 * stay the single source of which languages exist.
 */
export default function i18nOutput(): AstroIntegration {
	let site = ''
	return {
		name: 'zone:i18n-output',
		hooks: {
			'astro:config:done': ({ config }) => {
				site = config.site ?? ''
			},
			'astro:build:done': async ({ dir, pages, logger }) => {
				const htmlPages = pages.filter(({ pathname }) => pathname === '' || pathname.endsWith('/'))
				const built: BuiltPage[] = await Promise.all(
					htmlPages.map(async ({ pathname }) => ({
						url: new URL(`/${pathname}`, site).href,
						...readHeadLinks(await readFile(new URL(`${pathname}index.html`, dir), 'utf8')),
					})),
				)

				await writeFile(new URL('sitemap.xml', dir), sitemapXml(built))
				const redirects = legacyRedirects(built)
				await appendFile(new URL('_redirects', dir), `\n# Generated: URLs from before locale prefixes\n${redirects.join('\n')}\n`)
				logger.info(`sitemap.xml with ${built.filter((p) => p.canonical === p.url).length} URLs, ${redirects.length} legacy redirects`)
			},
		},
	}
}
