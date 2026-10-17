import type { Messages } from './en'

export default {
	siteDescription: 'Hongyu Zhang 关于软件工程、投资与经济学的笔记，附多语言译文，以及 dowse、refuge 等开源工具。',
	siteIdentity: '站点标识',

	writing: '文章',
	listening: '收听',
	reading: '阅读',
	recents: '最近',
	books: '书籍',
	rssFeed: 'RSS 订阅',
	footerNav: '页脚导航',
	footerSections: '栏目',
	readingSections: '阅读栏目',
	readingPages: '阅读页面',
	language: '语言',
	copyright: '保留所有权利。',

	noPosts: '暂无文章',
	noPostsHint: '稍后再来看看。',

	readingTitle: '阅读',
	readingDescription: '我读过的文章、博客和论文，按时间倒序排列，主要关于软件工程、经济学和投资。',
	noReading: '暂无文章',
	noReadingHint: '我读过的文章、博客和论文会出现在这里。',
	listeningTitle: '播客',
	listeningDescription: '我收听的播客节目，集中在一处，可直接播放，按时间倒序排列。',
	booksTitle: '书籍',
	booksSubtitle: '塑造了我的书',
	booksDescription: '塑造了我对软件、商业和投资思考方式的书，附封面和每本书的链接。',

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

	untranslated: (source: string) => `本页暂无简体中文版本，以下按原文语言（${source}）显示。`,
	translatedFrom: (source: string) => `译自${source}。`,
	readOriginal: '阅读原文',
	outdatedTranslation: '原文在本译文完成后有更新。',
	alsoAvailableIn: '其他语言版本：',
} satisfies Messages
