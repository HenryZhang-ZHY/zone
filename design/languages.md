# Languages

The site ships in eight locales: `en`, `es`, `de`, `ja`, `fr`, `pt`, `ru`, `zh-Hans`. The design does not create a second layout for any of them.

## The switch

One compact control in the header. It names languages in their own words — English, Español, Deutsch, 日本語, Français, Português, Русский, 简体中文 — and opens a two-column list. No flags: a flag names a country, not a language. No checkmark: the current language is the ink item, the others are secondary.

Each link carries `hreflang` and `lang`. The document carries its own `lang`. The URLs are localized (`/ja/blog/…`, `/zh-hans/blog/…`); the root negotiates `Accept-Language`, remembers an explicit choice, and exposes `hreflang` alternates. The footer keeps the full language index for readers and crawlers; the header is the quick switch.

## The scripts

| Script            | Face                                | Size / leading | Measure |
| ----------------- | ----------------------------------- | -------------- | ------- |
| Latin, Cyrillic   | Newsreader, with the serif fallback | 22 / 1.68      | 78ch    |
| Chinese, Japanese | Platform reading stack              | 18 / 1.90      | 40em    |
| Apparatus         | IBM Plex Mono                       | 11–14 / 1.4    | —       |

- Latin and Cyrillic share the serif reading voice. Cyrillic falls through the same stack; Newsreader's coverage is checked, not assumed.
- Chinese and Japanese use the platform reading stack: `PingFang SC` / `Hiragino Sans` / `Noto Sans CJK`, with the matching Japanese or Simplified Chinese order. They get 18px / 1.9, a 40em measure, 0.75em block gaps, zero heading tracking, no uppercase and no synthetic italic.
- The mono apparatus is unchanged in every language: dates, labels, section numbers, code, the edge index.
- A script is a voice, not a layout. The shell, the 78ch article column, the numbered sections and the edge index stay put.

## Dates and numbers

Dates come from `Intl.DateTimeFormat`; numbers from `Intl.NumberFormat` where a number is presented as data. A fixed `YYYY.MM.DD` is an apparatus format, not a universal one. The date is part of the mono column, so it stays scannable while its order changes.

## What not to do

- Do not add a flag row.
- Do not put all eight languages in the header; the menu is the index.
- Do not use a translated language name where the endonym is clearer.
- Do not set `letter-spacing` or uppercase on Han characters.
- Do not use faux italic for a face that has no italic.
- Do not create a per-language page width; the measure is a property of the script, not the locale.
- Do not machine-translate the interface and call it i18n. The chrome is translated per locale; the content declares what exists.

## The set is fixed

Eight locales is the supported set. Adding a ninth is a content and operations decision, not a design default; it would also need a font-coverage, line-breaking and — for an RTL language — bidi audit. The current demo does not plan for more.

The live demo is [apps/design/src/pages/languages.astro](../apps/design/src/pages/languages.astro).
