import type { Messages } from './en'

export default {
	siteDescription: 'Notas de Hongyu Zhang sobre ingeniería de software, inversión y economía, con traducciones y herramientas de código abierto como dowse y refuge.',
	siteIdentity: 'Identidad del sitio',

	writing: 'Escritos',
	listening: 'Escuchando',
	reading: 'Lecturas',
	recents: 'Recientes',
	books: 'Libros',
	rssFeed: 'Feed RSS',
	footerNav: 'Navegación del pie de página',
	footerSections: 'Secciones',
	readingSections: 'Secciones de lectura',
	readingPages: 'Páginas de lectura',
	language: 'Idioma',
	copyright: 'Todos los derechos reservados.',

	noPosts: 'Aún no hay artículos',
	noPostsHint: 'Vuelve más tarde.',

	readingTitle: 'Lecturas',
	readingDescription: 'Lista de los artículos, entradas de blog y trabajos que he leído, de más reciente a más antiguo, sobre todo de ingeniería de software, economía e inversión.',
	noReading: 'Aún no hay artículos',
	noReadingHint: 'Aquí aparecerán los artículos, entradas y trabajos que he leído.',
	listeningTitle: 'Pódcast',
	listeningDescription: 'Episodios de pódcast que escucho, reunidos en un solo lugar con reproductor integrado, del más reciente al más antiguo.',
	booksTitle: 'Libros',
	booksSubtitle: 'Libros que me formaron',
	booksDescription: 'Libros que han moldeado mi forma de pensar sobre el software, los negocios y la inversión, con sus portadas y un enlace a cada título.',

	seriesPart: (n: number) => `Parte ${n}`,
	seriesPartOf: (n: number, total: number) => `Parte ${n} de ${total}`,
	seriesPrev: 'Anterior',
	seriesNext: 'Siguiente',
	seriesNav: 'Navegación de la serie',
	toc: 'Contenido',
	tocLabel: 'Tabla de contenido',
	updatedOn: 'Actualizado el',
	footnotes: 'Notas',
	footnoteBack: (ref: string) => `Volver a la referencia ${ref}`,

	untranslated: (source: string) => `Esta página aún no está disponible en español. Se muestra en ${source}, el idioma en que se escribió.`,
	translatedFrom: (source: string) => `Traducción. Idioma original: ${source}.`,
	readOriginal: 'Leer el original',
	outdatedTranslation: 'El original ha cambiado desde que se hizo esta traducción.',
	alsoAvailableIn: 'También disponible en:',

	suggestLanguage: 'Esta página también está disponible en español.',
	switchLanguage: 'Leer en español',
	dismiss: 'Cerrar',
} satisfies Messages
