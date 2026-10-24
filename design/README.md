# Hairline

Hairline is the design language of **shuzhi.zone**. It is built from white paper, cool ink, 1px rules, IBM Plex Mono for structure, Newsreader for the reading voice, and one electric accent that has to earn its use.

The system is three things that must stay in sync:

| Layer         | Where                                        | What it owns                                                       |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| Tokens        | `packages/tokens/tokens.json` → `tokens.css` | Every color, type size, space, radius, shadow and duration         |
| UI            | `packages/ui`                                | Tailwind v4 theme, prose layer, Astro components, `tv()` recipes   |
| Documentation | `apps/design`                                | This system's rules, the component gallery, and four applied demos |

The live blog in `src/` now consumes `@zone/ui` and the Hairline tokens. The D-SIBs report and the stock-sell calculator are both Hairline pages; the calculator's ruled inputs and price matrix are described in [Patterns](./patterns.md).

## Start here

| If you want to                  | Read                                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Understand the direction        | [Principles](./principles.md)                                                                                                               |
| Change a color, size or spacing | [Foundations](./foundations.md)                                                                                                             |
| Add or change a component       | [Components](./components.md)                                                                                                               |
| Build a page                    | [Patterns](./patterns.md)                                                                                                                   |
| Design across languages         | [Languages](./languages.md)                                                                                                                 |
| Know why it changed             | [Decision 0001](./decisions/0001-hairline.md), [0002](./decisions/0002-serif-reading-voice.md), [0003](./decisions/0003-reading-measure.md), [0004](./decisions/0004-language-note.md), [0005](./decisions/0005-footer-sitemap.md) |

## Run it

```sh
bun install
bun run design        # documentation + demos at http://localhost:4321
bun run test          # includes the token sync test
bun run design:build  # static build of apps/design
```

`tokens.json` is the only source of values. `bun run tokens` regenerates `tokens.css`; the test fails when the checked-in CSS and the JSON disagree.

## The rules in one screen

- The page is pure white. The ink is a cool blue-black. No tinted paper.
- The article is one centered 78ch measure at 22px. No sidebars, no sticky cards, no rails. Serif is the reading voice; mono is the apparatus.
- The contents live at the right edge as hairline ticks; hover or focus reveals the labels. Reading and listening are separate pages.
- The header is identity and the language menu. The footer is the sitemap: writing, books, reading, listening, the feed.
- The three record pages open with a running head — name, count, one rule — and then one list. No lede, no player.
- The archive starts with the first entry. It is one flat list with full dates; no year groups, no introduction.
- The layout explains the page. Do not add a label or a description that repeats what the rules and the space already say.
- A language note is one line, never a box: a running head above an article, an inline line under a data page's lede, nothing on an index of mixed-language entries.
- Buttons, tags and structure are square. Inputs and small controls get 3px.
- One accent: links, focus, the current section. Never decoration.
- Motion is 120ms for state, 180ms for a menu, 260ms for an overlay. No reveal animations.

## What is intentionally absent

- Hero sections with a call to action.
- A primary navigation row in the header, and a second language list in the footer.
- Year-grouped archives and a combined reading/listening page.
- Card grids for writing.
- A left rail of article metadata.
- Boxed language notices, and a page-level language bar on an index of mixed-language entries.
- Drop caps, gradients, decorative illustration, shadows on content.
- A theme switch in the product. The demo switch exists to inspect the dark theme; the product follows the system.

## A note on the name

"Hairline" describes the visual signature: the page is drawn with 1px rules and space, not with boxes and fills. The product is shuzhi.zone; the system is Hairline.
