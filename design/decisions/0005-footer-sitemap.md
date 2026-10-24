# 0005 — The footer is the sitemap; the record pages are appendices

- Status: accepted
- Date: 2026-10-24
- Related: [0001](./0001-hairline.md), [0004](./0004-language-note.md), [0006](./0006-listening-row.md)
- Supersedes: the footer language list and the single 72px page top, in 0001 and 0004
- Partly superseded by: [0006](./0006-listening-row.md) — the listening row is its own component, and keeps the lines worth remembering

## Context

The header carried three equal items — Writing, Reading, Listening — but the content is not three sections of one size. Writing is 22 essays and the reason the site exists. Books is 14 covers: the only page with a visual object on it. Reading is 2 links and listening is 6; both are personal logs that store a title, a URL and nothing else. The nav promised three columns and delivered one column plus two stubs.

The pages themselves showed it. Reading opened with a 40px `阅读`, a paragraph explaining what a list of two links was, and a floating `书籍 →` button — the shelf, the strongest page, hidden behind a button inside its weaker sibling. Listening rendered an `<audio>` element per row, all of them reading `0:00 / 0:00` because `podcast.yaml` has no durations; `patterns.md` had said "a ledger, not a player" the whole time. Both pages also carried ordinal numbers, a source line and an arrow: three affordances for one link.

Page top was one number, `clamp(2.5rem, 6vw, 4.5rem)` — 72px at desktop — applied to the archive, the record pages and the article alike. Measured against comparable sites, index pages start their first item 8–49px under the header (jvns.ca 8, simonwillison.net 7, sive.rs 40, overreacted.io 46, leerob.com 49, world.hey.com 49); 72 is a number for a page that opens with a title, not for a list. `4.5rem` was also off the spacing scale, and no document argued for it.

## Decision

1. **The header is identity and the language menu.** No primary nav: writing is `/`, so a "Writing" link would only point at the page you are reading.
2. **The footer is the sitemap** — Writing, Books, Reading, Listening, RSS — and nothing else: no description line, no link-group labels, no language row. There is exactly one language control on the site, and it lives in the header, where it persists on every page.
3. **The three record pages are appendices and share one head.** `RunningHead` renders the page name at 13px mono on the left, the count at 11px on the right and one hairline under both; it is the page's `h1`. It replaces `PageHeader`, its lede and its buttons.
4. **One row for two logs.** (Superseded by [0006](./0006-listening-row.md).) `RecordRow` is a mono lead, a serif title, the domain the link points at, and an external arrow. Reading's lead is the ISO date; listening's is the episode code (`E96`, `120`) parsed out of `ogTitle`, so the title stops repeating its own number. The shelf keeps `Book` and becomes a grid under the same head.
5. **No player, no ordinal, no second source line.** The pages link to the source. The data does not have a duration, so the page does not pretend to.
6. **Page top depends on what the page opens with.** `--z-layout-page-top` is `clamp(2rem, 4vw, 2.5rem)` (32–40px) for lists, the shelf and the instruments; `--z-layout-article-top` is `clamp(2.5rem, 5vw, 4rem)` (40–64px) for the article, the data report, the calculator and a series — pages that open with a 40px title.

## Consequences

- A first-time reader lands on the archive with no menu above it; the way to the logs is the footer, which is where a reader looks for an appendix.
- Reading and listening lose their titles, their ledes, the `书籍 →` button and the audio players. The shelf gains a footer entry of its own.
- Podcast titles are unchanged in `podcast.yaml`; the row splits the code off at render time (`splitEpisodeCode`), and a title without a code keeps its lead column empty.
- The article keeps its own air (64px) and drops the 72; the archive, the record pages and the demo shell start at 40. `BlogPost` switches to `pt-article-top`; the D-SIBs report, the calculator and a series use it too.
- `AudioPlayer`, `src/scripts/audio-player.ts`, `LanguageIndex` and `ListenRow` are removed. The footer no longer imports the eight-language list, and the header no longer renders a nav element at all.
- The i18n set grows three count functions (`readingCount`, `listeningCount`, `booksCount`) in eight locales; the pages read them from `t(locale)` so the running head stays plural-correct per language.
- 0004's consequences that mention the footer language list and the 72px top no longer hold; the article's note-versus-title padding is now 40 versus 64.
