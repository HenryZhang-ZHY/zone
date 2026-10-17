/** English is the reference set: every other locale must provide exactly these messages. */
const en = {
	siteDescription: 'Notes on software engineering, investing and economics by Hongyu Zhang, with translations and open-source tools such as dowse and refuge.',
	siteIdentity: 'Site identity',

	writing: 'Writing',
	listening: 'Listening',
	reading: 'Reading',
	recents: 'Recents',
	books: 'Books',
	rssFeed: 'RSS Feed',
	footerNav: 'Footer navigation',
	footerSections: 'Sections',
	readingSections: 'Reading sections',
	readingPages: 'Reading pages',
	language: 'Language',
	copyright: 'All rights reserved.',

	noPosts: 'No posts yet',
	noPostsHint: 'Check back later for new content.',

	readingTitle: 'Reading',
	readingDescription: 'A running list of the articles, blog posts and papers I have read, newest first, mostly on software engineering, economics and investing.',
	noReading: 'No articles yet',
	noReadingHint: "Articles, posts, and papers I've read will appear here.",
	listeningTitle: 'Podcast',
	listeningDescription: 'Podcast episodes I listen to, collected in one place with an inline player, newest first.',
	booksTitle: 'Books',
	booksSubtitle: 'Books that shaped me',
	booksDescription: 'Books that shaped how I think about software, business and investing, with the covers and links to each title on my shelf.',

	seriesPart: (n: number) => `Part ${n}`,
	seriesPartOf: (n: number, total: number) => `Part ${n} of ${total}`,
	seriesPrev: 'Previous',
	seriesNext: 'Next',
	seriesNav: 'Series navigation',
	toc: 'Table of Contents',
	tocLabel: 'Table of contents',
	updatedOn: 'Updated on',
	footnotes: 'Footnotes',
	footnoteBack: (ref: string) => `Back to reference ${ref}`,

	untranslated: (source: string) => `This page is not available in English yet. It is shown in ${source}, the language it was written in.`,
	translatedFrom: (source: string) => `Translated from ${source}.`,
	readOriginal: 'Read the original',
	outdatedTranslation: 'The original has changed since this translation was made.',
	alsoAvailableIn: 'Also available in',
}

export type Messages = typeof en

export default en
