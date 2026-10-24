import type { Messages } from './en'

export default {
	siteDescription: 'Notas de Hongyu Zhang sobre engenharia de software, investimentos e economia, com traduções e ferramentas de código aberto como dowse e refuge.',
	siteIdentity: 'Identidade do site',

	writing: 'Textos',
	listening: 'Ouvindo',
	reading: 'Leituras',
	recents: 'Recentes',
	books: 'Livros',
	rssFeed: 'Feed RSS',
	footerNav: 'Navegação do rodapé',
	footerSections: 'Seções',
	readingSections: 'Seções de leitura',
	readingPages: 'Páginas de leitura',
	language: 'Idioma',
	copyright: 'Todos os direitos reservados.',

	noPosts: 'Ainda não há textos',
	noPostsHint: 'Volte mais tarde.',

	readingTitle: 'Leituras',
	readingDescription: 'Uma lista dos artigos, posts de blog e papers que li, dos mais recentes aos mais antigos, principalmente sobre engenharia de software, economia e investimentos.',
	noReading: 'Ainda não há artigos',
	noReadingHint: 'Os artigos, posts e papers que li aparecerão aqui.',
	listeningTitle: 'Podcast',
	listeningDescription: 'Episódios de podcast que ouço, reunidos em um só lugar com player integrado, dos mais recentes aos mais antigos.',
	booksTitle: 'Livros',
	booksSubtitle: 'Livros que me formaram',
	booksDescription: 'Livros que moldaram minha forma de pensar sobre software, negócios e investimentos, com as capas e links para cada título.',

	seriesPart: (n: number) => `Parte ${n}`,
	seriesPartOf: (n: number, total: number) => `Parte ${n} de ${total}`,
	seriesPrev: 'Anterior',
	seriesNext: 'Próximo',
	seriesNav: 'Navegação da série',
	toc: 'Sumário',
	tocLabel: 'Sumário',
	updatedOn: 'Atualizado em',
	footnotes: 'Notas de rodapé',
	footnoteBack: (ref: string) => `Voltar à referência ${ref}`,

	original: 'Original',
	translatedFrom: (source: string) => `Tradução: ${source}`,
	originalUpdated: 'Original atualizado',
	readIn: (language: string) => `Ler em ${language}`,
} satisfies Messages
