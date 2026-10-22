export interface LanguageSample {
  tag: string
  name: string
  sentence: string
}

/**
 * The eight locales the live site ships. Endonyms, not translated names: a
 * reader looking for their language should recognize it in its own script.
 */
export const languages: LanguageSample[] = [
  { tag: 'en', name: 'English', sentence: 'A page is a promise: the sentence you are reading deserves the whole page.' },
  { tag: 'es', name: 'Español', sentence: 'Una página es una promesa: la frase que estás leyendo merece toda la página.' },
  { tag: 'de', name: 'Deutsch', sentence: 'Eine Seite ist ein Versprechen: Der Satz, den Sie lesen, verdient die ganze Seite.' },
  { tag: 'ja', name: '日本語', sentence: 'ページは約束です。いま読んでいるその一文に、ページのすべてを。' },
  { tag: 'fr', name: 'Français', sentence: 'Une page est une promesse : la phrase que vous lisez mérite toute la page.' },
  { tag: 'pt', name: 'Português', sentence: 'Uma página é uma promessa: a frase que você está lendo merece a página inteira.' },
  { tag: 'ru', name: 'Русский', sentence: 'Страница — это обещание: предложение, которое вы читаете, заслуживает всей страницы.' },
  { tag: 'zh-Hans', name: '简体中文', sentence: '一页纸是一个承诺：你正在读的这句话，值得占用整页。' },
]

export const languageMenuItems = languages.map(({ tag, name }) => ({
  tag,
  name,
  href: `#lang-${tag.toLowerCase()}`,
}))

export const formatSampleDate = (tag: string) =>
  new Intl.DateTimeFormat(tag, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date('2026-10-22T00:00:00Z'))
