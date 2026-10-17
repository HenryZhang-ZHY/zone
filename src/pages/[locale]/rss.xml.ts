import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { SITE_TITLE } from '../../consts'
import { localeStaticPaths, t, type Locale } from '../../i18n'
import { loadPosts } from '../../lib/posts'

export const getStaticPaths = localeStaticPaths

/** One feed per language, with the same entries as that language's home page. */
export async function GET(context: APIContext) {
	const locale = context.props.locale as Locale
	const { posts, localize } = await loadPosts()
	return rss({
		title: SITE_TITLE,
		description: t(locale).siteDescription,
		site: context.site!,
		customData: `<language>${locale}</language>`,
		items: posts.map((post) => {
			const entry = localize(post, locale)
			return { title: entry.title, description: entry.description, pubDate: post.data.pubDate, link: entry.href }
		}),
	})
}
