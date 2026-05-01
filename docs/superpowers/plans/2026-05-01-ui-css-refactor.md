# UI/CSS Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor CSS/UI implementation around `DESIGN.md`, with special attention to making `/d-sibs` visually consistent with the rest of the Astro site.

**Architecture:** Consolidate reusable visual decisions into `src/styles/global.css` and `src/styles/components.css`, then reduce page/component-scoped styles to local layout only. Preserve Astro structure and existing content/business logic.

**Tech Stack:** Astro 5, plain CSS imported by `BaseHead.astro`, TypeScript scripts for generated DOM, Vitest for logic tests.

---

## Reference Documents

- Design source of truth: `DESIGN.md`
- Refactor design spec: `docs/superpowers/specs/2026-05-01-ui-css-refactor-design.md`

## Ownership Model

Use sequential tasks. Do not run workers that touch the same files at the same time.

Suggested split:

- Worker A: Task 1 and Task 2
- Worker B: Task 3
- Worker C: Task 4
- Worker D: Task 5 and Task 6
- Worker E: Task 7 and Task 8

Each worker must check `git status --short` before editing and must not revert unrelated changes.

## File Map

- `src/styles/global.css`: design tokens, base layout, typography, table primitives.
- `src/styles/components.css`: shared UI primitives: controls, panels, fields, tags, metric cards, status cards, timeline, popover.
- `src/styles/markdown.css`: article/Markdown-only refinements.
- `src/pages/d-sibs.astro`: D-SIBs page composition; should stop defining global domain colors.
- `src/components/d-sibs/BankHistoryTable.astro`: D-SIBs table column widths and markup classes.
- `src/components/d-sibs/YearCompositionGrid.astro`: D-SIBs year composition layout and markup classes.
- `src/components/d-sibs/ChangesTimeline.astro`: D-SIBs timeline markup and local layout only.
- `src/components/d-sibs/BankSparkline.astro`: SVG geometry and data-viz classes.
- `src/components/d-sibs/SparklinePopover.astro`: popover shell should use global primitive styling; JS behavior should stay stable.
- `src/components/stock-sell/StockSellCalculator.astro`: calculator markup and local numeric/formula layout.
- `src/scripts/stock-sell-calculator.ts`: generated summary cards and yield labels.
- `src/components/Header.astro`, `src/components/Footer.astro`, `src/pages/index.astro`, `src/pages/listening.astro`, `src/pages/reading.astro`, `src/layouts/BlogPost.astro`: site-wide polish pass.

---

### Task 1: Normalize Global Design Tokens

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Inspect existing token usage**

Run:

```bash
rg -n "var\\(--z-|--z-|#[0-9A-Fa-f]{3,8}|hsl\\(|rgba\\(" src/styles src/pages src/components
```

Expected: output includes existing global tokens and page/component-scoped hard-coded colors. Use this list to avoid deleting tokens still in use.

- [ ] **Step 2: Update `src/styles/global.css` tokens**

Add these tokens inside the existing `:root` block after the current surface/background section:

```css
	/* === SEMANTIC SURFACES === */
	--z-color-surface: light-dark(#FFFFFF, #1F2937);
	--z-color-surface-soft: light-dark(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.05));
	--z-color-surface-muted: light-dark(#FAF7F5, #1F2937);
	--z-color-border-subtle: light-dark(rgba(0, 0, 0, 0.07), rgba(255, 255, 255, 0.08));

	/* === SHAPE & FOCUS === */
	--z-radius-none: 0;
	--z-radius-sm: 3px;
	--z-focus-ring: 2px solid var(--z-color-accent);
	--z-focus-offset: 2px;

	/* === DATA SEMANTICS === */
	--z-data-g1: light-dark(hsl(210, 12%, 50%), hsl(210, 15%, 65%));
	--z-data-g1-bg: light-dark(hsl(210, 15%, 92%), hsl(210, 10%, 18%));
	--z-data-g2: light-dark(hsl(38, 80%, 45%), hsl(38, 75%, 58%));
	--z-data-g2-bg: light-dark(hsl(38, 75%, 91%), hsl(38, 35%, 16%));
	--z-data-g3: light-dark(hsl(18, 80%, 50%), hsl(18, 75%, 60%));
	--z-data-g3-bg: light-dark(hsl(18, 80%, 92%), hsl(18, 35%, 16%));
	--z-data-g4: light-dark(hsl(350, 75%, 45%), hsl(350, 70%, 62%));
	--z-data-g4-bg: light-dark(hsl(350, 70%, 93%), hsl(350, 30%, 17%));
	--z-data-state: light-dark(hsl(220, 70%, 42%), hsl(220, 75%, 68%));
	--z-data-state-bg: light-dark(hsl(220, 60%, 93%), hsl(220, 30%, 17%));
	--z-data-joint: light-dark(hsl(170, 65%, 34%), hsl(170, 60%, 55%));
	--z-data-joint-bg: light-dark(hsl(170, 50%, 92%), hsl(170, 25%, 16%));
	--z-data-city: light-dark(hsl(280, 55%, 50%), hsl(280, 55%, 68%));
	--z-data-city-bg: light-dark(hsl(280, 45%, 93%), hsl(280, 25%, 17%));
```

- [ ] **Step 3: Remove negative letter spacing from global headings**

Change `.z-page-title` and `.z-section-title` in `src/styles/global.css` from negative tracking to zero tracking:

```css
.z-page-title {
	font-size: var(--z-text-h1);
	font-weight: 700;
	letter-spacing: 0;
	margin-bottom: var(--z-space-2);
	color: light-dark(#000000, #F9FAFB);
}

.z-section-title {
	font-size: var(--z-text-h2);
	font-weight: 700;
	letter-spacing: 0;
	margin-bottom: var(--z-space-2);
}
```

- [ ] **Step 4: Tokenize table surface/radius**

Update `.z-table-wrapper`:

```css
.z-table-wrapper {
	overflow-x: auto;
	border: 1px solid var(--z-color-border);
	border-radius: var(--z-radius-sm);
	background: var(--z-color-surface);
}
```

Keep `.z-data-table` behavior, but remove uppercase tracking if it feels too dashboard-like. Preferred header rule:

```css
.z-data-table th {
	text-align: left;
	padding: var(--z-space-3) var(--z-space-4);
	font-weight: 600;
	font-size: var(--z-text-xs);
	letter-spacing: 0;
	color: light-dark(#374151, #D1D5DB);
	border-bottom: 1px solid var(--z-color-border);
	background: var(--z-color-surface-muted);
	white-space: nowrap;
}
```

- [ ] **Step 5: Run build check**

Run:

```bash
npm run build
```

Expected: Astro build completes successfully.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "refactor: normalize design tokens"
```

---

### Task 2: Expand Shared Component Primitives

**Files:**
- Modify: `src/styles/components.css`

- [ ] **Step 1: Replace hard-coded primitive values with tokens**

In `src/styles/components.css`, update existing primitives to use the tokens from Task 1:

```css
.z-btn-primary,
.z-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 8px 16px;
  font-size: var(--z-text-sm);
  font-weight: 600;
  border: none;
  border-radius: var(--z-radius-none);
  cursor: pointer;
  background: var(--z-color-accent);
  color: var(--z-color-text-invert);
  transition: background 0.15s;
  line-height: 1.43;
}

.z-btn-primary:hover,
.z-button:hover {
  background: var(--z-color-accent-high);
}

.z-btn-primary:active,
.z-button:active {
  background: #005FA3;
}

.z-btn-primary:disabled,
.z-button:disabled {
  background: var(--z-color-gray-5);
  color: var(--z-color-gray-4);
  cursor: not-allowed;
}
```

Use the same tokenization style for `.z-btn-secondary`, `.z-btn-ghost`, `.z-btn-icon`, `.z-panel`, `.z-metric-card`, `.z-field input`, and `.z-input`.

- [ ] **Step 2: Add shared tag variants**

Replace the existing `.z-tag` and `.z-pill` rules with sharp, design-system-aligned tags:

```css
.z-tag,
.z-pill {
  display: inline-block;
  font-size: var(--z-text-2xs);
  font-weight: 600;
  line-height: 1.5;
  padding: 0.125rem 0.4rem;
  border-radius: var(--z-radius-sm);
}

.z-tag--state,
.tag-state {
  background: var(--z-data-state-bg);
  color: var(--z-data-state);
}

.z-tag--joint,
.tag-joint {
  background: var(--z-data-joint-bg);
  color: var(--z-data-joint);
}

.z-tag--city,
.tag-city {
  background: var(--z-data-city-bg);
  color: var(--z-data-city);
}

.z-tag--g1,
.g1 {
  background: var(--z-data-g1-bg);
  color: var(--z-data-g1);
}

.z-tag--g2,
.g2 {
  background: var(--z-data-g2-bg);
  color: var(--z-data-g2);
}

.z-tag--g3,
.g3 {
  background: var(--z-data-g3-bg);
  color: var(--z-data-g3);
}

.z-tag--g4,
.g4 {
  background: var(--z-data-g4-bg);
  color: var(--z-data-g4);
}
```

Important: if `.g1` to `.g4` create unwanted background on elements that only need text color, remove those alias selectors and use explicit `.z-tag--g*` in markup instead. The safer approach is explicit `.z-tag--g*` classes.

- [ ] **Step 3: Add shared metric card internals**

Add:

```css
.z-metric-card {
  background: var(--z-color-surface-soft);
  border: 1px solid var(--z-color-border-subtle);
  padding: var(--z-space-4) var(--z-space-5);
  border-radius: var(--z-radius-sm);
}

.z-metric-label {
  font-size: var(--z-text-xs);
  color: var(--z-color-text-dimmed);
  margin-bottom: var(--z-space-1);
}

.z-metric-value {
  font-size: var(--z-text-xl);
  font-weight: 700;
  color: var(--z-color-text);
}
```

- [ ] **Step 4: Add shared timeline/status primitives**

Add:

```css
.z-timeline {
  position: relative;
  padding-left: var(--z-space-8);
}

.z-timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--z-color-hairline-light);
}

.z-timeline-item {
  position: relative;
  margin-bottom: var(--z-space-8);
}

.z-timeline-item:last-child {
  margin-bottom: 0;
}

.z-timeline-marker {
  position: absolute;
  left: calc(var(--z-space-8) * -1);
  top: 0.35rem;
  width: 15px;
  height: 15px;
  border-radius: var(--z-radius-sm);
  background: var(--z-color-surface);
  border: 1px solid var(--z-color-text-secondary);
}

.z-status-card {
  display: flex;
  gap: var(--z-space-3);
  align-items: flex-start;
  margin-bottom: var(--z-space-2);
  padding: var(--z-space-3) var(--z-space-4);
  font-size: var(--z-text-sm);
  background: var(--z-color-surface-soft);
  border: 1px solid var(--z-color-border-subtle);
  border-left-width: 3px;
  border-radius: var(--z-radius-sm);
}

.z-status-card--enter {
  border-left-color: var(--z-color-green-high);
}

.z-status-card--exit {
  border-left-color: var(--z-color-red-high);
}

.z-status-card--up {
  border-left-color: var(--z-color-orange-high);
}

.z-status-card--down {
  border-left-color: var(--z-color-blue-high);
}

.z-status-icon {
  font-size: var(--z-text-lg);
  font-weight: 700;
  line-height: 1.3;
  flex-shrink: 0;
}
```

- [ ] **Step 5: Add shared popover primitive**

Add:

```css
.z-popover {
  position: fixed;
  z-index: 100;
  background: var(--z-color-surface);
  border: 1px solid var(--z-color-border);
  border-radius: var(--z-radius-sm);
  box-shadow: var(--z-shadow-md);
  color: var(--z-color-text);
}

.z-popover-header {
  display: flex;
  align-items: center;
  gap: var(--z-space-2);
}
```

- [ ] **Step 6: Run build check**

Run:

```bash
npm run build
```

Expected: build completes. Visual differences are expected until later tasks migrate markup.

- [ ] **Step 7: Commit**

```bash
git add src/styles/components.css
git commit -m "refactor: add shared ui primitives"
```

---

### Task 3: Migrate D-SIBs Color and Tag System

**Files:**
- Modify: `src/pages/d-sibs.astro`
- Modify: `src/components/d-sibs/BankHistoryTable.astro`
- Modify: `src/components/d-sibs/YearCompositionGrid.astro`
- Modify: `src/components/d-sibs/BankSparkline.astro`
- Modify: `src/components/d-sibs/SparklinePopover.astro`

- [ ] **Step 1: Remove page-scoped domain tokens**

Delete the entire `<style>` block from `src/pages/d-sibs.astro`. The page should end after `</BaseLayout>`.

- [ ] **Step 2: Update `BankHistoryTable.astro` tag markup**

Change type tag markup:

```astro
<span class={`z-tag type-tag ${typeClass(bank.latestType, 'tag')}`}>{typeLabel(bank.latestType)}</span>
```

Change group tag markup:

```astro
return <td class="col-year">{info ? <span class={`z-tag group-tag z-tag--g${info.group}`}>{groupLabels[info.group]}</span> : <span class="not-listed">—</span>}</td>
```

- [ ] **Step 3: Reduce `BankHistoryTable.astro` local CSS**

Remove local `.type-tag`, `.tag-state`, `.tag-joint`, `.tag-city`, `.group-pill`, and `.group-pill.g*` rules. Keep only column sizing and local table alignment:

```css
.col-name {
  font-weight: 600;
  min-width: 140px;
}

.col-type {
  min-width: 70px;
}

.col-year {
  text-align: center;
  min-width: 80px;
}

th.col-year {
  text-align: center;
}

.col-spark {
  min-width: 90px;
  text-align: center;
  cursor: pointer;
}

.col-spark:focus-visible {
  outline: var(--z-focus-ring);
  outline-offset: var(--z-focus-offset);
}

th.col-spark {
  text-align: center;
}

.not-listed {
  color: var(--z-color-text-dimmed);
}
```

- [ ] **Step 4: Update `YearCompositionGrid.astro` tag markup**

Change bank tag markup:

```astro
<span class={`z-tag comp-bank ${typeClass(entry.type, 'tag')}`}>{entry.name}</span>
```

Change group header class to avoid using `.g1` as a generic background tag:

```astro
<div class={`comp-header comp-header--g${group}`}>
```

- [ ] **Step 5: Reduce `YearCompositionGrid.astro` CSS**

Keep grid/card composition, but use global surface tokens and explicit group text tokens:

```css
.composition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--z-space-6);
}

.composition-year {
  background: var(--z-color-surface-soft);
  border: 1px solid var(--z-color-border-subtle);
  border-radius: var(--z-radius-sm);
  padding: var(--z-space-7) var(--z-space-8);
}

.composition-year h3 {
  font-size: var(--z-text-lg);
  font-weight: 700;
  margin-bottom: var(--z-space-4);
}

.composition-year h3 a {
  color: inherit;
  text-decoration: none;
}

.composition-year h3 a:hover {
  color: var(--z-color-text-accent);
  text-decoration: underline;
}

.comp-total {
  font-weight: 400;
  font-size: var(--z-text-sm);
  color: var(--z-color-text-secondary);
}

.comp-group {
  margin-bottom: var(--z-space-8);
}

.comp-group:last-child {
  margin-bottom: 0;
}

.comp-header {
  font-size: var(--z-text-xs);
  font-weight: 600;
  padding: 0 0 var(--z-space-2);
  margin-bottom: var(--z-space-2);
  display: flex;
  align-items: center;
  gap: var(--z-space-2);
  border-bottom: 1px solid var(--z-color-hairline-light);
}

.comp-header--g1 { color: var(--z-data-g1); }
.comp-header--g2 { color: var(--z-data-g2); }
.comp-header--g3 { color: var(--z-data-g3); }
.comp-header--g4 { color: var(--z-data-g4); }

.comp-label,
.comp-count {
  white-space: nowrap;
}

.comp-count {
  font-weight: 400;
  font-size: var(--z-text-2xs);
  color: var(--z-color-text-dimmed);
}

.comp-line {
  flex: 1;
}

.comp-banks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--z-space-2);
}

@media (max-width: 640px) {
  .composition-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Update `BankSparkline.astro` color variables**

Change these selectors:

```css
.spark-line.spark-state { stroke: var(--z-data-state); }
.spark-line.spark-joint { stroke: var(--z-data-joint); }
.spark-line.spark-city { stroke: var(--z-data-city); }
.spark-dot.spark-state { fill: var(--z-data-state); }
.spark-dot.spark-joint { fill: var(--z-data-joint); }
.spark-dot.spark-city { fill: var(--z-data-city); }
```

- [ ] **Step 7: Update `SparklinePopover.astro` shell classes**

Change root markup:

```astro
<div id="spark-popover" class="spark-popover z-popover" role="tooltip" aria-hidden="true">
  <div class="pop-header z-popover-header">
```

Change `.pop-type` markup stays dynamic, but CSS should use global tag shape:

```css
.spark-popover {
  padding: var(--z-space-3) var(--z-space-4) var(--z-space-2);
  pointer-events: none;
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
  width: 372px;
}

.pop-type {
  font-size: var(--z-text-2xs);
  padding: 0.125rem 0.4rem;
  border-radius: var(--z-radius-sm);
  font-weight: 600;
}

.pop-type.-state {
  background: var(--z-data-state-bg);
  color: var(--z-data-state);
}

.pop-type.-joint {
  background: var(--z-data-joint-bg);
  color: var(--z-data-joint);
}

.pop-type.-city {
  background: var(--z-data-city-bg);
  color: var(--z-data-city);
}
```

Update SVG colors:

```css
.pop-chart :global(.pop-line.-state) { stroke: var(--z-data-state); }
.pop-chart :global(.pop-line.-joint) { stroke: var(--z-data-joint); }
.pop-chart :global(.pop-line.-city) { stroke: var(--z-data-city); }
.pop-chart :global(.pop-dot.-state) { fill: var(--z-data-state); }
.pop-chart :global(.pop-dot.-joint) { fill: var(--z-data-joint); }
.pop-chart :global(.pop-dot.-city) { fill: var(--z-data-city); }
.pop-chart :global(.pop-group-label.pg1) { fill: var(--z-data-g1); }
.pop-chart :global(.pop-group-label.pg2) { fill: var(--z-data-g2); }
.pop-chart :global(.pop-group-label.pg3) { fill: var(--z-data-g3); }
.pop-chart :global(.pop-group-label.pg4) { fill: var(--z-data-g4); }
```

- [ ] **Step 8: Search for old D-SIBs variables**

Run:

```bash
rg -n "--g[1-4]|--t-state|--t-joint|--t-city|group-pill|border-radius: 1rem|border-radius: 0\\.25rem" src/pages/d-sibs.astro src/components/d-sibs
```

Expected: no matches for old variables or old pill radii. `group-pill` should be gone.

- [ ] **Step 9: Run checks**

Run:

```bash
npm test
npm run build
```

Expected: Vitest passes; Astro build completes.

- [ ] **Step 10: Commit**

```bash
git add src/pages/d-sibs.astro src/components/d-sibs/BankHistoryTable.astro src/components/d-sibs/YearCompositionGrid.astro src/components/d-sibs/BankSparkline.astro src/components/d-sibs/SparklinePopover.astro
git commit -m "refactor: align dsibs styling with design system"
```

---

### Task 4: Restyle D-SIBs Timeline

**Files:**
- Modify: `src/components/d-sibs/ChangesTimeline.astro`
- Modify: `src/styles/components.css` if Task 2 status primitives need small adjustments

- [ ] **Step 1: Update timeline markup to use shared primitives**

Change timeline classes:

```astro
<div class="timeline z-timeline">
```

Change item/marker classes:

```astro
<div class="timeline-item z-timeline-item">
  <div class="timeline-marker z-timeline-marker" />
```

Change change group classes:

```astro
<div class="change-group z-status-card z-status-card--enter">
  <span class="change-icon z-status-icon">＋</span>
```

Use these mappings:

- `change-enter` -> `z-status-card--enter`
- `change-exit` -> `z-status-card--exit`
- `change-up` -> `z-status-card--up`
- `change-down` -> `z-status-card--down`

- [ ] **Step 2: Reduce local timeline CSS**

Remove local rules for `.timeline`, `.timeline::before`, `.timeline-item`, `.timeline-marker`, `.change-group`, and status backgrounds. Keep only content-specific heading and text rules:

```css
.timeline-content h3 {
  font-size: var(--z-text-lg);
  font-weight: 700;
  margin-bottom: var(--z-space-3);
}

.change-group strong {
  display: block;
  margin-bottom: var(--z-space-1);
}

.change-banks {
  display: block;
  color: var(--z-color-text-secondary);
}

.change-enter .change-icon,
.z-status-card--enter .change-icon {
  color: var(--z-color-green-high);
}

.change-exit .change-icon,
.z-status-card--exit .change-icon {
  color: var(--z-color-red-high);
}

.change-up .change-icon,
.z-status-card--up .change-icon {
  color: var(--z-color-orange-high);
}

.change-down .change-icon,
.z-status-card--down .change-icon {
  color: var(--z-color-blue-high);
}

.no-change {
  color: var(--z-color-text-dimmed);
  font-size: var(--z-text-sm);
}
```

If old `change-enter` classes remain only for icon color compatibility, keep them temporarily. Preferred final markup can remove them after confirming selectors are not used elsewhere.

- [ ] **Step 3: Check page build**

Run:

```bash
npm run build
```

Expected: build completes.

- [ ] **Step 4: Commit**

```bash
git add src/components/d-sibs/ChangesTimeline.astro src/styles/components.css
git commit -m "refactor: use shared timeline primitives"
```

---

### Task 5: Align Stock Sell Calculator With Shared Primitives

**Files:**
- Modify: `src/components/stock-sell/StockSellCalculator.astro`
- Modify: `src/scripts/stock-sell-calculator.ts`
- Modify: `src/styles/components.css` if generated classes need compatibility aliases

- [ ] **Step 1: Update calculator button class**

Change:

```astro
<button id="calc-btn" class="z-button" type="button">计算卖点</button>
```

To:

```astro
<button id="calc-btn" class="z-btn-primary" type="button">计算卖点</button>
```

- [ ] **Step 2: Remove local token block**

Delete the `:root` and `@media (prefers-color-scheme: dark)` token blocks from `StockSellCalculator.astro`. Yield/profit colors should use global semantic tokens or global class aliases.

- [ ] **Step 3: Remove local shared-primitive overrides**

Delete local rules that restyle these as separate systems:

- `.input-card, .explain-card`
- `.input-group label`
- `.input-group input`
- `.input-group input:focus`
- `#calc-btn`
- `#calc-btn:hover`
- `.summary-card`
- `:global(.summary-card)`
- `.card-label`
- `:global(.card-label)`
- `.card-value`
- `:global(.card-value)`
- `.yield-pill`
- `:global(.yield-pill)`
- `.yield-low`, `.yield-mid`, `.yield-high`, `.yield-max` and matching `:global(...)`

Keep local rules for:

- `.input-grid`
- `.calculator-error`
- column widths and numeric alignment
- `.formula-group`, `.formula-label`, `.formula-eq`, `.explain-note`
- mobile layout rules

- [ ] **Step 4: Update generated summary card classes**

In `src/scripts/stock-sell-calculator.ts`, change generated card class names so cards use global metric primitives.

Expected generated card function shape:

```ts
function createSummaryCard(label: string, value: string): HTMLElement {
  const card = document.createElement('div')
  card.className = 'summary-card z-metric-card'

  const labelEl = document.createElement('div')
  labelEl.className = 'card-label z-metric-label'
  labelEl.textContent = label

  const valueEl = document.createElement('div')
  valueEl.className = 'card-value z-metric-value'
  valueEl.textContent = value

  card.append(labelEl, valueEl)
  return card
}
```

If the function name differs, update the existing equivalent code without changing calculation logic.

- [ ] **Step 5: Update generated yield pill classes**

In `src/scripts/stock-sell-calculator.ts`, change yield cell generation from:

```ts
appendText(yieldCell, `yield-pill ${yieldClass(point.yieldPercent)}`, `${point.yieldPercent}%`, 'span')
```

To:

```ts
appendText(yieldCell, `z-tag yield-pill ${yieldClass(point.yieldPercent)}`, `${point.yieldPercent}%`, 'span')
```

Then update `yieldClass()` to return global semantic tag classes:

```ts
function yieldClass(yieldPercent: number): string {
  if (yieldPercent <= 8) return 'z-tag--g4 yield-low'
  if (yieldPercent <= 15) return 'z-tag--g3 yield-mid'
  if (yieldPercent <= 30) return 'z-tag--g2 yield-high'
  return 'z-tag--g1 yield-max'
}
```

Keep legacy `yield-*` class names in the return value for readability and tests/debugging, but styling should come from `.z-tag--g*`.

- [ ] **Step 6: Profit color alignment**

In `StockSellCalculator.astro`, replace profit color rules with global semantic tokens:

```css
.calculator-error {
  color: var(--z-color-red-high);
  font-size: var(--z-text-sm);
  margin-bottom: var(--z-space-4);
}

.profit-pos,
:global(.profit-pos) {
  color: var(--z-color-green-high);
  font-weight: 600;
}
```

- [ ] **Step 7: Run tests**

Run:

```bash
npm test
npm run build
```

Expected: calculator tests and D-SIBs tests pass; build completes.

- [ ] **Step 8: Commit**

```bash
git add src/components/stock-sell/StockSellCalculator.astro src/scripts/stock-sell-calculator.ts src/styles/components.css
git commit -m "refactor: align stock calculator ui primitives"
```

---

### Task 6: Site-Wide Style Cleanup

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/listening.astro`
- Modify: `src/pages/reading.astro`
- Modify: `src/layouts/BlogPost.astro`
- Modify: `src/styles/markdown.css` only for tokenization and letter-spacing cleanup

- [ ] **Step 1: Find hard-coded style drift**

Run:

```bash
rg -n "letter-spacing: -|#[0-9A-Fa-f]{3,8}|border-radius: 0\\.25rem|border-radius: 1rem|hsl\\(" src/components src/pages src/layouts src/styles/markdown.css
```

Expected: matches remain before cleanup.

- [ ] **Step 2: Remove negative letter spacing**

Replace negative heading/brand letter spacing with `letter-spacing: 0` in:

- `src/components/Header.astro`
- `src/pages/index.astro`
- `src/pages/listening.astro`
- `src/layouts/BlogPost.astro`

Do not use viewport-based font-size scaling. Keep existing token-based font sizes.

- [ ] **Step 3: Tokenize Header**

In `Header.astro`, convert hard-coded colors and spacing to tokens:

```css
.header {
	position: sticky;
	top: 0;
	z-index: var(--z-z-index-navbar);
	background-color: var(--z-color-bg-nav);
	border-bottom: 1px solid var(--z-color-border);
}

.nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	margin: 0 auto;
	max-width: 1278px;
	padding: 0 var(--z-nav-pad-x);
	height: var(--z-nav-height);
}

.brand a {
	font-weight: 700;
	letter-spacing: 0;
	font-size: var(--z-text-base);
	color: light-dark(#000000, #F9FAFB);
}
```

For `.hamburger-line`, use:

```css
background-color: var(--z-color-text);
border-radius: var(--z-radius-none);
```

- [ ] **Step 4: Tokenize Footer**

In `Footer.astro`, replace hard-coded border/text colors with:

```css
.footer {
	display: flex;
	flex-direction: column;
	align-items: center;
	border-top: 1px solid var(--z-color-border);
	font-size: var(--z-text-sm);
	padding: var(--z-space-8) 0;
	color: var(--z-color-text-dimmed);
}

.copyright {
	color: var(--z-color-text-dimmed);
	font-size: var(--z-text-2xs);
}
```

- [ ] **Step 5: Tokenize reading/listening/index local spacing**

Use `var(--z-space-*)` where values map directly:

- `0.5rem` -> `var(--z-space-2)`
- `0.75rem` -> `var(--z-space-3)`
- `1rem` -> `var(--z-space-4)`
- `1.25rem` -> `var(--z-space-5)`
- `1.5rem` -> `var(--z-space-6)`
- `2rem` -> `var(--z-space-8)`
- `2.5rem` -> `var(--z-space-10)`
- `3rem` -> `var(--z-space-12)`
- `4rem` -> avoid if possible; use `var(--z-space-15)` for 60px or keep `4rem` only when it is a deliberate local grid rhythm

- [ ] **Step 6: Review `BlogPost.astro` article title**

Replace:

```css
font-size: clamp(var(--z-text-h3), 4vw, var(--z-text-h1));
letter-spacing: -0.02em;
```

With:

```css
font-size: var(--z-text-h1);
letter-spacing: 0;
```

Keep mobile overrides if needed:

```css
@media (max-width: 768px) {
	.article-title {
		font-size: var(--z-text-4xl);
		margin-bottom: var(--z-space-4);
	}
}

@media (max-width: 480px) {
	.article-title {
		font-size: var(--z-text-3xl);
		line-height: 1.2;
	}
}
```

- [ ] **Step 7: Run checks**

Run:

```bash
npm run build
```

Expected: build completes.

- [ ] **Step 8: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/pages/index.astro src/pages/listening.astro src/pages/reading.astro src/layouts/BlogPost.astro src/styles/markdown.css
git commit -m "refactor: clean up site-wide style drift"
```

---

### Task 7: Visual QA and Responsive Pass

**Files:**
- Modify only files that have visible issues found in this task.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Astro dev server starts and prints a local URL, usually `http://127.0.0.1:4321/`.

- [ ] **Step 2: Check required pages**

Open these paths at desktop width around 1280px:

- `/`
- `/reading`
- `/listening`
- `/stock-sell`
- `/d-sibs`
- `/blog/d-sibs/`

Expected:

- Header and footer are consistent.
- Headings use the same type rhythm.
- Cards/panels use subtle surfaces and `3px` radius.
- Buttons are square-cornered and blue for primary action.
- Tables have consistent header, border, hover, and density.
- D-SIBs tags and charts use small semantic accents only.

- [ ] **Step 3: Check mobile**

Set viewport to 375px wide and check:

- `/`
- `/listening`
- `/stock-sell`
- `/d-sibs`

Expected:

- No horizontal page overflow except intentional table scroll wrappers.
- Header hamburger works.
- Touch targets are readable and usable.
- D-SIBs composition cards become one column.
- Stock calculator form becomes one column.

- [ ] **Step 4: Check tablet**

Set viewport to 768px wide and check:

- `/reading`
- `/d-sibs`

Expected:

- Reading grid is stable.
- D-SIBs table scrolls horizontally inside `.z-table-wrapper`.
- Composition grid uses available width without cramped text.

- [ ] **Step 5: Check D-SIBs popover**

On `/d-sibs`, hover and click a sparkline cell in the "变迁" column.

Expected:

- Popover appears near the target.
- Popover uses the same border/surface/radius as other panels.
- Chart lines and dots render.
- Escape closes locked popover.
- Focus on the sparkline cell shows a visible focus outline.

- [ ] **Step 6: Fix visual issues**

Only adjust the specific files that own each issue. Keep fixes token-based. Examples:

- If a tag is still pill-shaped, change it to `.z-tag` or `border-radius: var(--z-radius-sm)`.
- If a card is too dark, use `var(--z-color-surface-soft)`.
- If a local color duplicates a token, replace it with the token.
- If a mobile layout overflows, reduce local min-width or rely on `.z-table-wrapper` horizontal scroll.

- [ ] **Step 7: Stop dev server**

Stop the running dev server with `Ctrl+C`.

- [ ] **Step 8: Run final checks**

Run:

```bash
npm test
npm run build
```

Expected: tests pass; build completes.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "fix: polish responsive ui consistency"
```

---

### Task 8: Final Audit

**Files:**
- Modify: `docs/superpowers/plans/2026-05-01-ui-css-refactor.md` only if execution notes are added by the implementing agent.

- [ ] **Step 1: Check for old local D-SIBs styles**

Run:

```bash
rg -n "--g[1-4]|--t-state|--t-joint|--t-city|group-pill|type-tag \\{|tag-state \\{|tag-joint \\{|tag-city \\{" src/pages/d-sibs.astro src/components/d-sibs
```

Expected: no old local token definitions or duplicated tag rules. Markup class names like `type-tag` may remain only if they do not define style locally.

- [ ] **Step 2: Check rounded pill drift**

Run:

```bash
rg -n "border-radius: 1rem|border-radius: 0\\.25rem|border-radius: 50%" src
```

Expected: no `1rem` or `0.25rem` pill radius. `border-radius: 50%` may remain only if there is a real circular control or indicator. For D-SIBs timeline markers, prefer `var(--z-radius-sm)` over circles.

- [ ] **Step 3: Check negative tracking drift**

Run:

```bash
rg -n "letter-spacing: -" src
```

Expected: no matches.

- [ ] **Step 4: Check hard-coded color drift**

Run:

```bash
rg -n "#[0-9A-Fa-f]{3,8}|hsl\\(" src/components src/pages src/layouts src/styles
```

Expected: hard-coded colors remain mostly in `src/styles/global.css` token definitions and `src/styles/markdown.css` expressive-code overrides. Any hard-coded color in page/component styles must have a short reason in code review notes.

- [ ] **Step 5: Final verification**

Run:

```bash
npm test
npm run build
```

Expected: tests pass; build completes.

- [ ] **Step 6: Final commit**

If Task 8 made documentation or small cleanup changes:

```bash
git add docs src
git commit -m "chore: audit ui css refactor"
```

If Task 8 made no changes, do not create an empty commit.

---

## Completion Criteria

The work is complete when:

- `npm test` passes.
- `npm run build` passes.
- `/d-sibs` no longer defines its own `:root` domain palette.
- D-SIBs tag, group, timeline, popover, and table styling come from shared primitives.
- Stock calculator cards/buttons/forms/tags use shared primitives.
- Negative letter spacing is removed from project UI styles.
- Rounded pills are replaced by `3px` tags unless a circular indicator is deliberately required.
- Hard-coded page/component colors are either removed or justified as local SVG/Markdown rendering details.
- Desktop, tablet, and mobile visual QA has been performed on the required pages.
