# Patterns

A pattern is a decision about where the eye starts and where it rests. The pages below share one shell, one reading measure and one index measure.

## The shell

- 1200px max width, fluid gutter, centered.
- Header, main and footer consume `.shell`; no page sets its own width.
- The article's 78ch measure is centered inside the shell; the archive and listening list keep 68ch.
- Page padding: 40–72px top, 64–112px bottom, depending on viewport.

## The archive

```
2026-10-11  仓位管理…
             Excerpt…
             Series · 中文
2026-09-27  dowse: A Local Alternative…
2026-09-25  The Nature of the Firm…
```

- No introduction block, no sticky sidebar, no page title. The site header carries identity; the list carries the work.
- A visually hidden `h1` keeps the document outline correct.
- One flat list. No year groups, no month dividers. Every row carries its full ISO date.
- The row is the link. Date, title, optional excerpt, quiet metadata, hover arrow.
- Dates and metadata are mono; the title and excerpt are serif. That split is the whole system in miniature.
- No thumbnails. It is a list of writing, not a feed.
- The column is 68ch; at 1440px it is centered with air on both sides.

## The article

```
                 The Quiet Page
                 What a reading interface owes the reader.
                 2026.10.22 · 12 min · Copy link
                 ─────────────────────────────────
                 Opening paragraph…
       01        ─────────────────────────────────
                 The measure
                 …
```

- One centered 78ch measure at 22px. No left rail of metadata, no right TOC column, no sticky card.
- Title, 24px lede and 22px body set in the serif reading voice; metadata is one quiet mono row beneath them.
- A hairline closes the header; the body starts after one clean gap.
- `h2` sections carry a rule and a number in the left margin. Below 1180px the number moves above the heading.
- Metadata that used to live in a rail — date, reading time, copy link — is in the title block.
- The contents are the edge index: hairline ticks at the right viewport edge, labels on hover or focus. It never reserves a column.
- The article ends with footnotes, then the series pager, then the footer. No related-post grid.
- There is no reading-mode switch. Chinese and Japanese change the type values, not the structure. The edge index hides on mobile.

## The shelf

```
The shelf

[cover] [cover] [cover] [cover] [cover] [cover]
[cover] [cover] [cover] [cover] [cover] [cover]
```

- Books and listening are different pages. A book cover is an object; an episode is a row. Combining them made both weaker.
- A page title, then the books. No introduction paragraph and no "Books" section label; the covers explain themselves. A visually hidden `h2` keeps the semantics.
- Covers keep a 2:3 ratio, a 1px border and no shadow. Titles are serif, 14px; there are no stars, counts or completion metrics.
- Grid: `auto-fill` at 8.5rem minimum, six columns at 1440px, two at 390px.

## The listening list

```
Listening

01  Episode title                               ↗
    Source · language
02  …
```

- A ledger, not a player. The page links to the source; it does not pretend to own the audio.
- Index, title, source, external arrow. The title is serif; the index, source and duration are mono.
- One 68ch column. A listening list is still reading.
- No section label. The page title says Listening; the rows are obviously episodes. A visually hidden `h2` keeps the semantics.

## Documentation

The docs site is the one place with a left navigation column. It uses an 11rem sticky sidebar, the same 2px accent rule for the current page and the same hairline section breaks. The content column is 48rem because specimens need room. It is documentation chrome, not the product.

Specimens are framed by a 1px border and a small label bar. A specimen is the argument; avoid writing a paragraph that repeats it.

## Responsive behaviour

| Range        | Behavior                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `< 600px`    | 16px gutter; archive rows lose the arrow; the shelf grid is two columns; header nav moves to its own row |
| `600–899px`  | 24px gutter; nav single row; the article still one column                                                |
| `900–1179px` | Full navigation; docs sidebar; no edge index                                                             |
| `≥ 1180px`   | Edge index appears; the article keeps its 78ch measure                                                   |
| `≥ 1280px`   | Nothing changes; the page does not need a wider shell                                                    |

Type does not scale continuously. It steps down at 900px and 640px.
