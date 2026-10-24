# Components

Every component is a **Tailwind recipe first** and an Astro wrapper second. The wrapper exists to keep the markup honest, not to hide a second implementation.

- Recipes use `tv()` from `packages/ui/src/recipes/tv.ts`.
- Caller overrides go through `cn()` from `packages/ui/src/recipes/cn.ts`, which understands the custom type scale.
- No component sets a page width or a horizontal page margin. They fill their container.
- States are DOM states: `aria-current`, `aria-pressed`, `disabled`, `aria-invalid`.
- Every component must be checked in both themes and at 390px.

## Inventory

| Component      | Use                            | Notes                                                                          |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `Wordmark`     | Identity                       | `plain` (domain only) or `slash`; the domain dot is punctuation, not an accent |
| `BranchMark`   | The app mark                   | 60 line variants, 1.4px, `currentColor`; `/marks/` curates the latest round    |
| `LanguageMenu` | Language switch                | Endonyms, two-column panel, `hreflang` and `lang`; no flags                    |
| `SiteHeader`   | Identity + language menu       | No primary nav: writing is the home, everything else is in the footer          |
| `SiteFooter`   | Wordmark, sitemap links, ©     | The site's whole map; no link-group labels, no language row                    |
| `PageHeader`   | Page title, optional lede      | Used by pages that open with a subject: the data report, the calculator, a series |
| `RunningHead`  | Page name + count, one hairline| Opens every record page; the layout explains, so there is no lede              |
| `Entry`        | Archive row                    | Date, title, excerpt, meta, arrow; the whole row links                         |
| `Tag`          | Quiet taxonomy                 | Square, 1px, 11px; accent variant for a current state                          |
| `GroupMark`    | Categorical group              | 6px data-color square plus an optional number or full label; color is never the only carrier |
| `CompositionBar` | Part-to-whole data            | Flex segments with 1px gaps; pass `max` to share a baseline across rows        |
| `Button`       | Primary, secondary, quiet      | 40px / 32px; square                                                            |
| `NoteLine`     | Language provenance            | One line, no box; `runhead` above an article, `inline` under a data page's lede |
| `SectionHead`  | Label, count, rule, action     | Optional; the reading and listening pages do not use it                        |
| `SeriesPager`  | Previous / next essay          | Hairline top; two columns                                                      |
| `Book`         | Cover + title                  | 2:3 cover, 1px border, no shadow                                               |
| `RecordRow`    | Reading / listening row        | A mono lead (date or episode code), serif title, optional channel cover and name, where it points, external arrow |
| `Callout`      | Note inside prose              | 2px start rule; label optional                                                 |
| `Figure`       | Image + caption                | Optional plain variant for specimens                                           |
| `CodeBlock`    | Fenced code                    | Optional filename bar                                                          |
| `EdgeToc`      | Article contents               | Fixed hairline ticks; labels on hover/focus                                    |

## Primitives

Tables and form fields are HTML, so their recipes live in `packages/ui/src/styles/primitives.css` using `@apply` and the same tokens:

- `.z-table-wrap`, `.z-table`
- `.z-field`, `.z-field__label`, `.z-field__hint`, `.z-field__error`
- `.z-input`
- `.z-checkbox`

They are the only component-looking classes that are not Astro components. Use them when the markup is naturally tabular or a native form control.

## Data display

Categorical data has two components; everything else is a table or a row.

- `GroupMark` is a 6px square in the group color plus an optional `label`. Pass `srLabel` when the visible label is a number so the screen reader still hears “第 N 组”. The mark is the only categorical fill.
- `CompositionBar` is a flex row of segments. Pass the same `max` to several bars when their totals must be compared; the bar stops short of the container instead of always filling it. The 1px gaps are the hairline, not a border. `label` is required and should include the counts.
- Status words (new, exited, up, down) stay in ink with a `+`, `−`, `↑` or `↓`; they do not get success/danger fills. Group colors are data, not sentiment.
- A data page may use the full shell width and a matrix table. It still has no cards: a hero stat, a shared-baseline bar, a hairline table, a timeline and a two-column archive are enough.

## Prose

`.z-prose` is the one large custom CSS layer. It styles rendered Markdown and hand-written article HTML, because arbitrary content cannot carry utility classes on every element.

- Font family is `--z-font-prose`: Newsreader for Latin, the platform reading stack for `:lang(zh)` / `:lang(ja)`. The article column is 22px / 1.68 in a 78ch measure, with a 24px lede; the archive and listening list keep 16–20px in 68ch. Mono is never a prose face.
- `.z-prose--numbered` puts `01`, `02` in the left margin on wide screens and above the heading below 1180px.
- Headings get a hairline above them; the number is the section index used by the edge contents.
- Lists use hanging dashes and tabular ordered numbers.
- Blockquotes are Newsreader italic regardless of the prose voice.
- Tables and code blocks keep their own borders; everything else is separated by space.
- `.z-footnotes` is the quiet end block; the visible "Footnotes" label is intentionally absent.

## The edge index

`EdgeToc.astro` is the only navigation in the article. It renders:

- A fixed column of ticks at `right: 20px`, vertically centered.
- One tick per `h2`; the current section is a 26px, 2px accent line.
- A panel that appears on hover or `focus-within`, listing `h2` and `h3` with the same numbers as the prose.
- A scroll spy that sets `aria-current="location"` on the current panel link and the matching section tick.
- Hidden below 1180px. There is no mobile table of contents; the headings are the index.

## Adding a component

1. Check that the page actually needs a new component. A class combination repeated three times is a component; a one-off is markup.
2. Add or reuse tokens in `tokens.json`. Run `bun run tokens`.
3. Write the recipe with `tv()`; register any new `text-*` size in `merge-config.ts`.
4. Render semantic HTML, with the state on the element that owns it.
5. Add it to `apps/design/src/pages/components.astro` with a `DemoFrame`.
6. Check light, dark, 390px, keyboard focus and reduced motion.
7. If it changes a page pattern, update `design/patterns.md` in the same change.

## What not to do

- No component-level page widths, gutters or `max-width` formulas.
- No boxed language notice. Language provenance is one line: `NoteLine` with `runhead` on an article, `inline` on a data page, and no note on an index of mixed-language entries.
- No hex values, raw px outside the scale, or inline durations.
- No `z-index` beyond the existing layers: edge index 40, demo controls 50, docs header 30.
- No business copy in `packages/ui`. The words belong to the site.
- No second table of contents in a sidebar.
