export type Lang = 'en' | 'zh-CN'

const messages = {
	en: {
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
	},
	'zh-CN': {
		seriesPart: (n: number) => `第 ${n} 篇`,
		seriesPartOf: (n: number, total: number) => `第 ${n} 篇，共 ${total} 篇`,
		seriesPrev: '上一篇',
		seriesNext: '下一篇',
		seriesNav: '系列导航',
		toc: '目录',
		tocLabel: '目录',
		updatedOn: '更新于',
		footnotes: '脚注',
		footnoteBack: (ref: string) => `返回引用 ${ref}`,
	},
} satisfies Record<Lang, unknown>

export const t = (lang: Lang = 'en') => messages[lang] ?? messages.en

const dateFormats: Record<Lang, Intl.DateTimeFormatOptions> = {
	en: { year: 'numeric', month: 'short', day: 'numeric' },
	'zh-CN': { year: 'numeric', month: 'long', day: 'numeric' },
}

export const formatDate = (date: Date, lang: Lang = 'en') =>
	date.toLocaleDateString(lang, { ...dateFormats[lang], timeZone: 'UTC' })
