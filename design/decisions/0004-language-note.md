# 0004 — A language note is one line

- Status: accepted
- Date: 2026-10-24
- Related: [0001](./0001-hairline.md), [0003](./0003-reading-measure.md), [0005](./0005-footer-sitemap.md)
- Partly superseded by: [0005](./0005-footer-sitemap.md) — the footer language list, and the 72px article top

## Context

A page that is a fallback or a translation used to put a `TranslationNotice` box between the site header and `#main`. The box was a sibling of the page, so the page's own `py-page-top` decided the space below it: 16px from the header, 72px to the title. On a full-width D-SIBs page the box stayed at the 78ch reading measure (749px) while the report was 1136px wide, 194px to the right of the content edge.

It was also a container for any number of paragraphs. `TranslationNotice` rendered the provenance, the outdated note and the "also available" list; `LanguageSuggestion` appended a second message in the target language, sometimes duplicating the first and linking to the same URL. Notice mode had no dismiss; banner mode did.

The design system already had a boxed `Notice` component, but the live site reimplemented it inline. The component and the product had drifted.

## Decision

1. **The note is one line.** `NoteLine` renders `provenance · target endonym →`: `Original · 简体中文 →`, `Translated from English · 简体中文 →`. It does not accept children or multiple paragraphs.
2. **Placement follows the page's measure.**
   - Article pages: `runhead`, above the title, provenance left, target right, one hairline. The article's top padding is 40 when the note is present, 64 when it is not.
   - Data, tool and series-index pages: `inline`, under the lede, aligned to the page's own measure.
   - Index pages (Writing, Reading, Listening, Books): no page-level note. Their entries carry their own `lang`; the header language menu is the switch.
3. **Fallback, translation, or a preferred version.** A fallback or translation note is server-rendered. A same-language article with other versions renders the note hidden and reveals it before paint only when the reader prefers another version. A reader already in the right language sees no note. Index pages have no page-level note at all.
4. **The script replaces, never appends.** `src/scripts/language-note.ts` reads the cookie and `navigator.languages`, then swaps the href, `hreflang`, `lang`, endonym and aria-label of the one link the server rendered. It creates no node and moves no node.
5. **No dismiss.** The note is metadata, not a banner. Clicking the target sets the language cookie, so the next page opens in that language.
6. **The boxed `Notice` is retired** for language. `NoteLine` is the system primitive; the site's `LanguageNote` supplies the words and the matching logic. `TranslationNotice`, `LanguageSuggestion` and `Notice` are removed.

## Consequences

- The 72px gap and the 749px box are gone. The article starts with its running head and title; the data page's note starts at the page's own left edge.
- The note no longer lists every available language. The target is the reader's preferred available version, or the source when there is no better one. The header menu remains the full index.
- The old same-language suggestion banner is folded into the note's hidden/reveal state: a same-language article shows the note only when the reader prefers another version. A reader already in the right language sees no note. The header menu remains the full index and the switch on index pages.
- The article's top padding is a conditional 40/64. Pages without a note keep the article top; the difference is about 24px at the title and is part of the running head's composition.
- The copy no longer promises a translation ("not available in English yet"). It states provenance (`Original` / `Translated from …`) and offers a target.
- The docs gallery shows `NoteLine` in both placements; the `Notice` specimen is gone.
- Tests: the i18n copy and the per-locale key set changed; the visual checks are 1440, 1240, 390, light, dark and keyboard focus.
