# 0001 — White paper, one column, an edge index

- Status: accepted for the proposal
- Date: 2026-10-22
- Supersedes: the first Hairline proposal (warm paper, two article rails, archive intro column)

## Context

The live site is calm, content-first and mono-forward. It has a strong voice but no system: values are copied between components, corners and colors drift, and there is no place to see a component in isolation.

The first Hairline proposal tried to make the design more "editorial": warm paper, a sticky archive intro, a metadata rail on the left of the article and a table of contents on the right. The review was direct:

- The warm paper reads like a different product and creates aesthetic fatigue.
- The two-column archive intro delays the content.
- The side rails and the boxed TOC interrupt the reading.
- Secondary labels and descriptions were doing work the layout should do.

## Decision

1. **Pure white canvas.** Cool blue-black ink, a cool near-neutral line scale, one electric accent. No warm tint. This matches the brand's quiet, technical character and stays out of the way.
2. **No sidebars in the article.** One centered reading measure. Metadata moves under the title; the table of contents moves to the viewport edge. The measure is now 78ch at 22px; see [0003](./0003-reading-measure.md).
3. **The edge index.** A fixed stack of hairline ticks at the right edge, one per section, the current one accented. Hover or focus reveals the labels in a small panel. It reserves no column and disappears below 1180px.
4. **The archive starts with the list.** No introduction block. The site header carries identity and navigation; the entries and rows carry the writing.
5. **Fewer labels.** Remove section headings that the objects explain (the old combined library's "Books"/"Listening"; reading and listening are now separate pages), counts that add no meaning, the article's series eyebrow, the language line, the visible footnotes label, and the second line under every component specimen.
6. **Tailwind v4 + `tv()` recipes.** Keep `tokens.json` as the only source of values, map it into `@theme inline`, style components with utilities and `tv()`, and keep a custom CSS layer only for rendered prose and the form/table primitives.

## Consequences

- The article is calmer and reads as one page, not a dashboard.
- The contents are less discoverable; the ticks need a hover/focus or a learned affordance. The panel makes the full index available when reached for. On mobile there is no TOC.
- The archive loses a place for a standing introduction and a "now" block. If those return, they need a different pattern, not a second column.
- Removing visible section labels works because reading and listening are now separate pages: each page has one kind of object. Screen readers still get `h2`s.
- The live blog now consumes `@zone/ui`; the old `src/styles` and `DESIGN.md` notes were retired. The stock-sell calculator keeps a scoped token-compatibility stylesheet; the D-SIBs report uses the data components, not a second design system.
- Tailwind adds a build-time dependency and a custom merge configuration for the type scale. In exchange, the component layer is one vocabulary and the token mapping is explicit.
