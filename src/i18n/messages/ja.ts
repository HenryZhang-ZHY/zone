import type { Messages } from './en'

export default {
	siteDescription: 'Hongyu Zhang によるソフトウェアエンジニアリング、投資、経済学のノート。翻訳と、dowse や refuge などのオープンソースツールも公開しています。',
	siteIdentity: 'サイト名',

	writing: '執筆',
	listening: 'リスニング',
	reading: '読書',
	recents: '最近',
	books: '本',
	rssFeed: 'RSS フィード',
	footerNav: 'フッターナビゲーション',
	footerSections: 'セクション',
	readingSections: '読書セクション',
	readingPages: '読書ページ',
	language: '言語',
	copyright: 'All rights reserved.',

	noPosts: 'まだ記事はありません',
	noPostsHint: 'また後でお越しください。',

	readingTitle: '読書',
	readingDescription: '読んだ記事、ブログ記事、論文の一覧です。新しい順に並べています。主なテーマはソフトウェアエンジニアリング、経済学、投資です。',
	noReading: 'まだ記事はありません',
	noReadingHint: '読んだ記事、ブログ記事、論文がここに表示されます。',
	listeningTitle: 'ポッドキャスト',
	listeningDescription: '聴いているポッドキャストのエピソードを、プレーヤー付きで新しい順にまとめています。',
	booksTitle: '本',
	booksSubtitle: '自分を形作った本',
	booksDescription: 'ソフトウェア、ビジネス、投資についての考え方を形作った本です。表紙と各タイトルへのリンク付き。',

	seriesPart: (n: number) => `第${n}回`,
	seriesPartOf: (n: number, total: number) => `全${total}回中の第${n}回`,
	seriesPrev: '前へ',
	seriesNext: '次へ',
	seriesNav: 'シリーズナビゲーション',
	toc: '目次',
	tocLabel: '目次',
	updatedOn: '更新日',
	footnotes: '脚注',
	footnoteBack: (ref: string) => `参照 ${ref} に戻る`,

	original: '原文',
	translatedFrom: (source: string) => `${source}からの翻訳`,
	originalUpdated: '原文更新あり',
	readIn: (language: string) => `${language}で読む`,
} satisfies Messages
