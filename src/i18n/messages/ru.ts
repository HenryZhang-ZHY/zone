import type { Messages } from './en'

export default {
	siteDescription: 'Заметки Hongyu Zhang о разработке программного обеспечения, инвестициях и экономике, с переводами и открытыми инструментами, такими как dowse и refuge.',
	siteIdentity: 'Название сайта',

	writing: 'Статьи',
	listening: 'Слушаю',
	reading: 'Чтение',
	recents: 'Недавнее',
	books: 'Книги',
	rssFeed: 'RSS-лента',
	footerNav: 'Навигация в подвале',
	footerSections: 'Разделы',
	readingSections: 'Разделы чтения',
	readingPages: 'Страницы чтения',
	language: 'Язык',
	copyright: 'Все права защищены.',

	noPosts: 'Статей пока нет',
	noPostsHint: 'Загляните позже.',

	readingTitle: 'Чтение',
	readingDescription: 'Список прочитанных мной статей, записей в блогах и научных работ, от новых к старым, в основном о разработке ПО, экономике и инвестициях.',
	noReading: 'Статей пока нет',
	noReadingHint: 'Здесь появятся прочитанные мной статьи, записи и научные работы.',
	listeningTitle: 'Подкасты',
	listeningDescription: 'Выпуски подкастов, которые я слушаю, собранные в одном месте со встроенным плеером, от новых к старым.',
	booksTitle: 'Книги',
	booksSubtitle: 'Книги, которые меня сформировали',
	booksDescription: 'Книги, которые сформировали мой взгляд на программное обеспечение, бизнес и инвестиции, с обложками и ссылками на каждую.',

	seriesPart: (n: number) => `Часть ${n}`,
	seriesPartOf: (n: number, total: number) => `Часть ${n} из ${total}`,
	seriesPrev: 'Назад',
	seriesNext: 'Далее',
	seriesNav: 'Навигация по серии',
	toc: 'Содержание',
	tocLabel: 'Содержание',
	updatedOn: 'Обновлено',
	footnotes: 'Примечания',
	footnoteBack: (ref: string) => `Вернуться к ссылке ${ref}`,

	untranslated: (source: string) => `Этой страницы пока нет на русском языке. Она показана на языке оригинала (${source}).`,
	translatedFrom: (source: string) => `Перевод. Язык оригинала: ${source}.`,
	readOriginal: 'Читать оригинал',
	outdatedTranslation: 'Оригинал изменился после этого перевода.',
	alsoAvailableIn: 'Другие языки:',
} satisfies Messages
