# 0002 — Serif is the reading voice; mono is the apparatus

- Status: accepted
- Date: 2026-10-22
- Related: [0001](./0001-hairline.md)

## Context

The first system used IBM Plex Mono for nearly everything, including long-form English prose. It was a deliberate notebook voice, but it is not a publication convention. Mono-only body text is common in developer blogs; it is rare in books, magazines and newspapers, because monospaced Latin has an even rhythm that becomes mechanical over thousands of words.

The review put it directly: mono does not look like a publication font, and serif feels better for reading. Typographic practice agrees, with one distinction worth keeping: **the text and the apparatus are different jobs**.

- Continuous reading wants a proportional text face with a comfortable measure and leading: a serif, in a literary/essay context.
- Dates, labels, navigation, numbers, code, section indexes and data tables are apparatus. A mono face makes them scannable and gives the publication its technical character.

## Decision

1. **Newsreader is the default reading voice** at 22px / 1.68. It carries article titles, ledes, body prose, entry titles and excerpts, book titles and listening titles.
2. **IBM Plex Mono is the apparatus** at label scale and for code: dates, series and language metadata, navigation, numbers, table values, section indexes, the edge index, the wordmark.
3. **There is no reader-facing reading-mode switch.** Serif is the only prose voice; mono is the apparatus. A reader should not have to configure the page's typography before reading.
4. **Chinese and Japanese are unaffected by the Latin choice.** Prose resolves to the platform reading stack at 18px / 1.9.
5. **The type scale stays family-agnostic.** `text-heading-40` supplies size, leading and tracking; `font-prose` or `font-ui` supplies the voice. The docs type specimens show editorial sizes in serif and labels/buttons in mono.

## Consequences

- The article reads as a publication rather than a notebook; the brand survives in the chrome (wordmark, dates, numbers, the edge index, code).
- The product has one reading voice. A code-heavy note uses the code block, not a mono paragraph.
- Type specimens and documentation must show both families in their intended roles; a single all-mono scale is no longer an accurate picture.
- The serif needs its italics and a slightly larger body size, so the font payload grows by the Newsreader italic subset. It is the only added asset.
- The entry index becomes a hybrid: serif title and excerpt, mono date and metadata. This is the system in miniature, and it is the rule to check when adding a new surface: **is this text, or is this apparatus?**

## Considered alternatives

- **Mono as the only reading voice.** Rejected: it is a developer-blog convention, not a publication one, and it becomes mechanical over long texts.
- **Serif default with a mono reading-mode toggle.** Rejected after review. A typography switch is a configuration burden, and the product does not need two reading voices. The demo no longer exposes one.
- **Sans for Latin.** Rejected: the publication voice is serif. The platform sans remains the CJK reading stack, where it is the native screen convention.
