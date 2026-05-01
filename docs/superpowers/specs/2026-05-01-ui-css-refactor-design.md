# UI/CSS Refactor Design

## Goal

Refactor the project's CSS and UI implementation around `DESIGN.md` so the site has one coherent visual system, lower style duplication, and maintainable page-specific styling. The highest-priority visible fix is bringing `/d-sibs` back into the same minimalist, content-first style as the writing, reading, listening, article, and stock calculator pages.

## Current State

The project is an Astro site. Global styles are imported from `src/components/BaseHead.astro` in this order:

1. `normalize.css`
2. `src/styles/global.css`
3. `src/styles/components.css`
4. `src/styles/markdown.css`

The existing global layer already has useful foundations:

- `src/styles/global.css` defines color, type, spacing, layout, stack, table, and page header primitives.
- `src/styles/components.css` defines buttons, panels, metric cards, fields, and tag-like primitives.
- `src/styles/markdown.css` owns rendered article content and expressive-code overrides.

The problem is that important UI rules are repeated in page/component-scoped `<style>` blocks:

- `/d-sibs` defines domain colors in `src/pages/d-sibs.astro` and repeats type tag/group pill styling in `BankHistoryTable.astro`, `YearCompositionGrid.astro`, and `SparklinePopover.astro`.
- `StockSellCalculator.astro` defines a second metric/card/pill/status color system and overrides shared `.z-panel`, `.z-field`, and `.z-button` behavior locally.
- Header, footer, index, listening, reading, and blog article styles mostly follow the design system, but still use negative letter spacing, hard-coded colors, and component-specific spacing values that should be expressed through tokens.

## Design Principles From DESIGN.md

Implementation must follow these constraints:

- Typography: IBM Plex Mono + LXGW WenKai stack; no negative letter spacing; headings use weight/size, not tracking, for hierarchy.
- Color: primary text is brand navy or pure black; electric blue is reserved for primary interactive states; coral red and warning yellow are used sparingly for semantic emphasis.
- Surfaces: transparent or very light card backgrounds, subtle borders, little to no shadow.
- Shape: sharp corners for major UI, `3px` only for subtle cards, inputs, and similar small containers.
- Spacing: use the existing 4px-based `--z-space-*` scale.
- Responsive behavior: one-column mobile, tablet two-column where appropriate, desktop max-width constrained layouts.
- Accessibility: visible hover/focus states, minimum mobile touch target of 44px for interactive controls, readable contrast.

## Proposed Architecture

Use a three-layer CSS architecture:

1. **Design tokens** in `src/styles/global.css`
   Define raw design tokens and semantic aliases only. This includes color aliases, radii, spacing, typography, surface, focus, and small domain-safe semantic tokens.

2. **Reusable UI primitives** in `src/styles/components.css`
   Define shared classes used by Astro pages/components: buttons, panels, forms, tables, tags, badges, metric cards, timeline, data-viz legend/tag classes, popover shell, and responsive grids.

3. **Content-specific styles** in component/page `<style>` blocks
   Keep only layout details that are truly local: column widths, grid min widths, SVG geometry, and page-specific composition. Local styles must consume global tokens/primitives and must not redefine brand colors, radii, base controls, or repeated tag/card styles.

## Naming Rules

Keep the existing `z-` prefix for global reusable primitives.

Recommended global primitive names:

- Layout: `.z-main`, `.z-section`, `.z-stack-list`, `.z-stack-item`, `.z-cluster`, `.z-responsive-grid`
- Typography: `.z-page-title`, `.z-section-title`, `.z-muted`, `.z-caption`, `.z-tabular`
- Surfaces: `.z-panel`, `.z-panel--compact`, `.z-metric-grid`, `.z-metric-card`
- Controls: `.z-btn-primary`, `.z-btn-secondary`, `.z-btn-ghost`, `.z-btn-icon`, `.z-button`
- Forms: `.z-field`, `.z-input`
- Data display: `.z-table-wrapper`, `.z-data-table`, `.z-data-table--numeric`
- Tags: `.z-tag`, `.z-tag--state`, `.z-tag--joint`, `.z-tag--city`, `.z-tag--g1`, `.z-tag--g2`, `.z-tag--g3`, `.z-tag--g4`
- Timeline/status: `.z-timeline`, `.z-timeline-item`, `.z-timeline-marker`, `.z-status-card`, `.z-status-card--enter`, `.z-status-card--exit`, `.z-status-card--up`, `.z-status-card--down`
- Popovers: `.z-popover`, `.z-popover-header`

Keep legacy aliases during the refactor:

- `.z-button` should remain as an alias of primary button behavior.
- Existing generated classes from scripts, such as `.summary-card`, `.yield-pill`, `.profit-pos`, can remain, but their styling should move into global primitives or script-generated markup should be updated in the same task.

## Token Changes

Update `src/styles/global.css` to make tokens clearer and reduce misuse:

- Add radius tokens:
  - `--z-radius-none: 0`
  - `--z-radius-sm: 3px`
- Add focus tokens:
  - `--z-focus-ring: 2px solid var(--z-color-accent)`
  - `--z-focus-offset: 2px`
- Add surface tokens:
  - `--z-color-surface: light-dark(#FFFFFF, #1F2937)`
  - `--z-color-surface-soft: light-dark(rgba(255,255,255,0.45), rgba(255,255,255,0.05))`
  - `--z-color-surface-muted: light-dark(#FAF7F5, #1F2937)`
  - `--z-color-border-subtle: light-dark(rgba(0,0,0,0.07), rgba(255,255,255,0.08))`
- Rename no existing public tokens unless all usages are changed in the same task.
- Leave dark mode support in place using `light-dark(...)`.

Domain semantic colors should be global and restrained:

- D-SIBs bank type tokens:
  - `--z-data-state`, `--z-data-state-bg`
  - `--z-data-joint`, `--z-data-joint-bg`
  - `--z-data-city`, `--z-data-city-bg`
- D-SIBs group tokens:
  - `--z-data-g1`, `--z-data-g1-bg`
  - `--z-data-g2`, `--z-data-g2-bg`
  - `--z-data-g3`, `--z-data-g3-bg`
  - `--z-data-g4`, `--z-data-g4-bg`
- Finance/yield tokens can reuse group/semantic tokens where possible rather than creating unrelated HSL palettes:
  - low risk/high yield display can use `--z-data-g1`/`--z-data-g1-bg`
  - warning-ish yield can use `--z-color-orange-high`/`--z-color-orange-low`
  - high alert can use `--z-color-red-high`/`--z-color-red-low`

## D-SIBs Visual Direction

`/d-sibs` should feel like the rest of the site: quiet, data-dense, text-first, and precise. It should not feel like a separate dashboard theme.

Required changes:

- Remove `:root` domain color definitions from `src/pages/d-sibs.astro`.
- Move all bank-type and group tag styling into global `.z-tag--*` primitives.
- Keep table-first layout for historical details.
- Keep sparklines and popover behavior, but restyle popover as a shared `.z-popover` surface.
- Replace rounded pill shapes (`border-radius: 1rem` and `0.25rem`) with `3px` tags.
- Convert timeline change blocks from brightly filled colored bands into subtle bordered status cards:
  - neutral soft surface background
  - left border or icon color for status semantics
  - no heavy saturated full-row fills
- Keep semantic colors only where they help scan data: small tags, chart lines/dots, left border markers, and icons.

## Stock Calculator Visual Direction

`StockSellCalculator.astro` should use the same cards, button, field, table, metric, and tag primitives as the rest of the site.

Required changes:

- Remove local overrides that make `.input-card`, `.explain-card`, and `.summary-card` use `var(--z-color-black)` as a surface.
- Use `.z-panel` for input and explanation cards.
- Use `.z-metric-card` for generated summary cards.
- Use `.z-tag` variants for generated yield labels, with `3px` radius.
- Use `.z-btn-primary` instead of custom `#calc-btn` styling.
- Keep finance-specific numeric alignment and generated result logic local.

## Site-Wide Cleanup

The site-wide polish pass should:

- Replace hard-coded brand palette values in component styles with tokens.
- Remove negative letter spacing from headings and brand text.
- Use `var(--z-space-*)` spacing instead of one-off rem values when values map cleanly.
- Keep local styles only when they encode local layout or component geometry.
- Normalize responsive breakpoints around `480px`, `640px`, `768px`, `1024px`, and `1200px` as currently used, without inventing a CSS preprocessor.
- Ensure all touch/click controls have clear hover/focus states.

## Non-Goals

Do not change content data, routes, Markdown rendering behavior, RSS behavior, business logic, or generated calculation results.

Do not introduce Tailwind, CSS modules, Sass, component libraries, or new frontend frameworks.

Do not redesign the information architecture. This is a system consolidation and visual consistency refactor, not a product rewrite.

## Verification Requirements

Every implementation agent should run:

```bash
npm test
npm run build
```

Visual QA should cover:

- `/`
- `/reading`
- `/listening`
- `/stock-sell`
- `/d-sibs`
- at least one blog post, preferably `/blog/d-sibs/` if generated

Viewport checks:

- mobile: 375px wide
- tablet: 768px wide
- desktop: 1280px wide

Acceptance criteria:

- No page has obvious visual drift from `DESIGN.md`.
- `/d-sibs` uses the same typography, surface, radius, spacing, and table style as the rest of the site.
- Tags, pills, cards, buttons, inputs, and tables are styled from shared primitives.
- Domain colors are small accents, not competing page themes.
- Build and tests pass.
