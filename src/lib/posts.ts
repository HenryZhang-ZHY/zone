import { type CollectionEntry, getCollection } from 'astro:content'
import { localizePath, type Locale } from '../i18n'
import { groupTranslations, resolvePost, type ResolvedPost } from './localized'

export type Post = CollectionEntry<'blog'>
export type Translation = CollectionEntry<'translations'>
export type LocalizedPost = ResolvedPost<Translation> & { post: Post; href: string }

/** Site path of a post: its own page, or the tool page it stands in for. */
export const postPath = (post: Post) => post.data.redirect ?? `/blog/${post.id}/`

/**
 * Loads every original with its translations, newest first. The only module in
 * src/lib that reads content collections, so pages share one resolver.
 */
export async function loadPosts() {
	const [posts, translations] = await Promise.all([getCollection('blog'), getCollection('translations')])
	posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
	const byPost = groupTranslations(posts, translations)

	const localize = (post: Post, locale: Locale): LocalizedPost => ({
		...resolvePost(post, byPost.get(post.id), locale),
		post,
		href: localizePath(postPath(post), locale),
	})

	return { posts, localize }
}

let warned = false

/** Warns once per build about translations older than their original. */
export function warnOutdatedTranslations(posts: Post[], localize: (post: Post, locale: Locale) => LocalizedPost) {
	if (warned) return
	warned = true
	for (const post of posts) {
		for (const locale of localize(post, post.data.lang).available) {
			if (localize(post, locale).outdated) console.warn(`[i18n] blog/${post.id}/${locale}.md is older than the original's last update`)
		}
	}
}
