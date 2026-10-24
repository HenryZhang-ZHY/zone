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
- No page-level language note. The entries carry their own `lang` and the page has no single content language; the header language menu is the switch.
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
- When the page is a fallback or a translation, a language note is a running head above the title: provenance left, target endonym right, one hairline. It is not a box and it never carries a second paragraph. The note replaces the page's top gap: the article content starts at 40, not 72, and the note sits above the title. On a same-language article with other versions it stays hidden until the reader prefers another version.
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

## The data report

```
数据观察 / D-SIBs
中国系统重要性银行
4 期发布 · 2021–2025 · 最新 2025

2025  21 家  █████████████████████
      第四组 4  第三组 2  第二组 4  第一组 11
                              发布记录 01 2021 …
                              最近变化 2023 → 2025

01 历年规模   [shared-baseline bars]
02 银行明细   [hairline matrix]
03 名单变化   [hairline timeline]
04 各期名单   [two-column archive]
```

- The data report uses the full shell width, not the 78ch reading measure. Comparison needs the room; the reading pages keep their measure.
- One hero finding: a single large number, its delta, and one composition bar. The release ledger sits beside it on a hairline, not in a second card.
- Every bar shares the same `max`; the row for 19 must be visibly shorter than the row for 21. A card grid of totals hides the only comparison that matters.
- The matrix is a table, not a set of cards. Group cells are a 6px data square plus the group number; the legend carries the labels. The first column sticks when the table scrolls sideways.
- The language note, when the report is a fallback, is an inline line under the lede. It follows the full shell measure, not the reading measure, and it sits above the release metadata rule.
- Status changes use ink and `+`/`−`/`↑`/`↓`; no success/danger fills. The group colors are the only categorical color.
- The archive is two columns of names separated by `·`; the latest release gets a 2px accent top rule. No boxes, no tag pills.
- Sections carry only a number and a title. No explanatory note, no inline contents row: the same fixed edge index as the article carries the four anchors. It appears from 1320px so the full-width table is never covered; below that, the headings are the index.
- The only shadow is the sparkline popover; it is a movable surface, not a content card.

## The calculator

```
01 卖点表                                    显示全部 95 档
   6% 目标下，只卖 100 股需 25.00 元；卖 900 股只需 10.19 元。
                卖出 100  200  300  …  900
                剩余 900  800  700  …  100
   6%   8.33      25.00   16.67 13.89 … 10.19
   7%   7.14      35.71   21.43 16.67 … 10.32
```

- The calculator is an instrument, not a form. Three ruled fields in one ledger row, no card and no calculate button: it computes as you type.
- The result is a matrix, not a long list. Rows are target dividend yields; columns are shares sold. The diluted cost moves into the row header and the remaining shares into the column header, so a cell carries exactly one number: the sell price.
- Columns are deciles of the position, floored to 100-share lots, so the matrix stays nine columns wide from 1,000 shares to a million. The deciles are a sample, not the rule: the header can swap the nearest decile for any 100-share lot, and the pinned column is the only accent in the table. The first fifteen yields are visible; the rest sit behind one quiet button.
- The page starts empty with one line of instruction. Results replace it in place; nothing scrolls or jumps.
- The method closes the page as section 02: formulas in mono, three short caveats, and the only "not investment advice" line on the page.
- The input strip is the one form on the page. It is ruled top and bottom rather than boxed; focus is a 2px accent rule under the active cell, and a per-field error replaces the quiet line under the field.
- A live result summary is announced after typing stops, not on every keystroke.

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
