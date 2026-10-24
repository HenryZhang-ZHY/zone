import type { Messages } from './en'

export default {
	siteDescription: 'Notizen von Hongyu Zhang zu Softwareentwicklung, Investieren und Ökonomie, mit Übersetzungen und Open-Source-Tools wie dowse und refuge.',
	siteIdentity: 'Website-Identität',

	writing: 'Texte',
	listening: 'Hören',
	reading: 'Lesen',
	recents: 'Neueste',
	books: 'Bücher',
	rssFeed: 'RSS-Feed',
	footerNav: 'Fußzeilen-Navigation',
	footerSections: 'Bereiche',
	readingSections: 'Lesebereiche',
	readingPages: 'Leseseiten',
	language: 'Sprache',
	copyright: 'Alle Rechte vorbehalten.',

	noPosts: 'Noch keine Beiträge',
	noPostsHint: 'Schau später wieder vorbei.',

	readingTitle: 'Lesen',
	readingDescription: 'Eine laufende Liste der Artikel, Blogbeiträge und Paper, die ich gelesen habe, die neuesten zuerst, meist zu Softwareentwicklung, Ökonomie und Investieren.',
	noReading: 'Noch keine Artikel',
	noReadingHint: 'Hier erscheinen Artikel, Beiträge und Paper, die ich gelesen habe.',
	listeningTitle: 'Podcast',
	listeningDescription: 'Podcast-Folgen, die ich höre, an einem Ort gesammelt, mit integriertem Player, die neuesten zuerst.',
	booksTitle: 'Bücher',
	booksSubtitle: 'Bücher, die mich geprägt haben',
	booksDescription: 'Bücher, die mein Denken über Software, Unternehmen und Investieren geprägt haben, mit Covern und Links zu jedem Titel.',

	readingCount: (n: number) => `${n} Artikel`,
	listeningCount: (n: number) => `${n} Folgen`,
	booksCount: (n: number) => `${n} Bücher`,

	seriesPart: (n: number) => `Teil ${n}`,
	seriesPartOf: (n: number, total: number) => `Teil ${n} von ${total}`,
	seriesPrev: 'Zurück',
	seriesNext: 'Weiter',
	seriesNav: 'Serien-Navigation',
	toc: 'Inhalt',
	tocLabel: 'Inhaltsverzeichnis',
	updatedOn: 'Aktualisiert am',
	footnotes: 'Fußnoten',
	footnoteBack: (ref: string) => `Zurück zu Verweis ${ref}`,

	original: 'Original',
	translatedFrom: (source: string) => `Übersetzung: ${source}`,
	originalUpdated: 'Original aktualisiert',
	readIn: (language: string) => `In ${language} lesen`,
} satisfies Messages
