import type { Messages } from './en'

export default {
	siteDescription: 'Notes de Hongyu Zhang sur le génie logiciel, l’investissement et l’économie, avec des traductions et des outils open source comme dowse et refuge.',
	siteIdentity: 'Identité du site',

	writing: 'Écrits',
	listening: 'Écoute',
	reading: 'Lecture',
	recents: 'Récents',
	books: 'Livres',
	rssFeed: 'Flux RSS',
	footerNav: 'Navigation du pied de page',
	footerSections: 'Rubriques',
	readingSections: 'Rubriques de lecture',
	readingPages: 'Pages de lecture',
	language: 'Langue',
	copyright: 'Tous droits réservés.',

	noPosts: 'Aucun article pour l’instant',
	noPostsHint: 'Revenez plus tard.',

	readingTitle: 'Lecture',
	readingDescription: 'La liste des articles, billets de blog et publications que j’ai lus, du plus récent au plus ancien, surtout en génie logiciel, économie et investissement.',
	noReading: 'Aucun article pour l’instant',
	noReadingHint: 'Les articles, billets et publications que j’ai lus apparaîtront ici.',
	listeningTitle: 'Podcast',
	listeningDescription: 'Les épisodes de podcast que j’écoute, réunis en un seul endroit avec un lecteur intégré, du plus récent au plus ancien.',
	booksTitle: 'Livres',
	booksSubtitle: 'Les livres qui m’ont formé',
	booksDescription: 'Les livres qui ont façonné ma façon de penser le logiciel, l’entreprise et l’investissement, avec leurs couvertures et un lien vers chaque titre.',

	seriesPart: (n: number) => `Partie ${n}`,
	seriesPartOf: (n: number, total: number) => `Partie ${n} sur ${total}`,
	seriesPrev: 'Précédent',
	seriesNext: 'Suivant',
	seriesNav: 'Navigation de la série',
	toc: 'Sommaire',
	tocLabel: 'Table des matières',
	updatedOn: 'Mis à jour le',
	footnotes: 'Notes',
	footnoteBack: (ref: string) => `Retour à la référence ${ref}`,

	untranslated: (source: string) => `Cette page n’est pas encore disponible en français. Elle s’affiche en ${source}, sa langue d’origine.`,
	translatedFrom: (source: string) => `Traduction. Langue d’origine : ${source}.`,
	readOriginal: 'Lire l’original',
	outdatedTranslation: 'L’original a été modifié depuis cette traduction.',
	alsoAvailableIn: 'Également disponible en :',
} satisfies Messages
