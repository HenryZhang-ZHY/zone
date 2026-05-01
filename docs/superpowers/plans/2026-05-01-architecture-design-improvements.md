# Architecture And Design Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce page-level coupling, extract reusable domain and UI layers, and make the site's editorial/data-tool design system easier to extend safely.

**Architecture:** Keep Astro as the rendering layer. Move derived data, browser-only behavior, and repeated UI primitives out of large pages into focused modules under `src/lib`, `src/components`, and `src/styles`, with tests around pure transformation logic.

**Tech Stack:** Astro 5, Astro Content Collections, TypeScript strict mode, Vitest, scoped Astro styles, global CSS tokens.

---

## Current Architecture Problems

- `src/pages/d-sibs.astro` is 745 lines and mixes content loading, domain transformation, SVG chart geometry, table rendering, timeline rendering, semantic color definitions, and responsive styling in one file. The highest-risk section is the top-level transformation block around lines 17-147 and the inline sparkline generation around lines 184-224.
- `src/components/d-sibs/SparklinePopover.astro` is a component in name, but it depends on page-defined CSS variables and global DOM selectors (`td.col-spark[data-trajectory]`) instead of explicit props or a local API. This makes it hard to test and hard to reuse.
- `src/pages/listening.astro` mixes page markup, custom audio player markup, CSS, and browser script. The script at lines 327-399 binds only on `DOMContentLoaded`, which is fragile if Astro view transitions are introduced elsewhere and leaves no testable API for player state.
- `src/pages/stock-sell.astro` has a good pure calculation module (`src/lib/stock-sell-calc.ts`) with tests, but the UI script still builds summaries and table rows with `innerHTML` at lines 133-170. Current values are numeric, so the immediate XSS risk is low, but this pattern will become unsafe as soon as user-provided labels or external data are rendered.
- SEO and layout props are partially wired. `BaseLayout.astro` accepts `image` and computes `canonicalURL`, but neither is passed to `BaseHead`; `BaseHead.astro` recomputes canonical and owns analytics. This creates duplicate responsibility and makes page-level metadata hard to audit.
- The design system exists in `DESIGN.md` and `src/styles/global.css`, but implementation is uneven: generic utilities (`z-main`, `z-data-table`) coexist with page-specific card/input/chip patterns repeated in pages instead of reusable primitives.
- `src/styles/markdown.css` appears to carry Starlight-era selectors such as `.starlight-aside` and `--__sl-font-mono`, while this project is not using Starlight. That suggests copied CSS debt and increases the chance of dead or broken styling.
- README still describes the default Astro starter instead of this project's actual structure, package manager, deployment target, content model, and design rules.

## Current Design Problems

- The site has a clear editorial/data-tool visual direction, but component semantics are not centralized. Cards, tags, pills, tables, inputs, and page headers are implemented differently across `d-sibs`, `stock-sell`, `reading`, and `listening`.
- Interactive controls are under-specified. The audio player uses icon-only SVGs but lacks a visible thumb and uses hidden range thumbs; the stock calculator uses blocking `alert()` rather than inline validation states.
- Data-heavy pages rely on color to carry meaning. `d-sibs` group/type labels have text, which is good, but trend lines and popovers still rely heavily on color. The plan should keep textual redundancy for statuses.
- Responsive behavior is mostly present, but it is page-local and not backed by reusable layout primitives. For example, list, grid, table, and card responsive rules are repeated rather than shared.
- Accessibility contracts are inconsistent. Header navigation has ARIA state, but custom audio and sparkline popover interactions lack keyboard operation and robust focus behavior.

## Target File Structure

- Create: `src/lib/d-sibs.ts`
  - Owns D-SIBS domain types, group labels, type labels, type ordering, normalization, bank histories, year stats, and year-over-year changes.
- Create: `src/lib/__tests__/d-sibs.test.ts`
  - Tests D-SIBS transformation behavior with small inline fixtures.
- Create: `src/components/d-sibs/BankHistoryTable.astro`
  - Renders the detailed bank history table and delegates sparkline rendering to a smaller component.
- Create: `src/components/d-sibs/BankSparkline.astro`
  - Renders the compact SVG sparkline from explicit props.
- Create: `src/components/d-sibs/ChangesTimeline.astro`
  - Renders year-over-year changes.
- Create: `src/components/d-sibs/YearCompositionGrid.astro`
  - Renders per-year group composition.
- Modify: `src/components/d-sibs/SparklinePopover.astro`
  - Keep it as browser behavior, but make its data contract explicit and add keyboard/focus support.
- Create: `src/components/audio/AudioPlayer.astro`
  - Owns player markup and scoped styles.
- Create: `src/scripts/audio-player.ts`
  - Owns browser behavior for all audio players and supports re-initialization.
- Modify: `src/pages/listening.astro`
  - Use `AudioPlayer` and remove inline player script.
- Create: `src/components/stock-sell/StockSellCalculator.astro`
  - Owns stock calculator markup, validation display, and result placeholders.
- Create: `src/scripts/stock-sell-calculator.ts`
  - Owns DOM behavior for calculator initialization and safe DOM rendering.
- Modify: `src/pages/stock-sell.astro`
  - Use `StockSellCalculator` and keep the page as composition only.
- Modify: `src/layouts/BaseLayout.astro`
  - Forward `image`, `canonicalURL`, `lang`, and optional analytics settings to head/layout components.
- Modify: `src/components/BaseHead.astro`
  - Make metadata behavior explicit and remove duplicated layout concerns.
- Create: `src/styles/components.css`
  - Shared component primitives for panels, fields, buttons, tags, summary metrics, table wrappers, and page-local data labels.
- Modify: `src/styles/global.css`
  - Keep tokens and layout primitives only.
- Modify: `src/styles/markdown.css`
  - Remove stale Starlight selectors and fix `--__sl-font-mono` to use the project's mono token.
- Modify: `README.md`
  - Replace starter text with actual project documentation.

## Task 1: Fix Layout And Metadata Boundaries

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/BaseHead.astro`

- [ ] Step 1: Remove unused `canonicalURL` from `BaseLayout.astro` unless it is passed to `BaseHead`.
- [ ] Step 2: Add props to `BaseHead.astro`: `canonicalURL?: URL | string`, `image?: string`, `type?: 'website' | 'article'`.
- [ ] Step 3: In `BaseLayout.astro`, compute `canonicalURL = new URL(Astro.url.pathname, Astro.site)` once and pass `title`, `description`, `image`, and `canonicalURL` into `BaseHead`.
- [ ] Step 4: Keep analytics in `BaseHead` for now, but add a comment or prop boundary so later environments can disable it without editing metadata markup.
- [ ] Step 5: Run `bun run build`.
- [ ] Step 6: Verify generated HTML for `/`, `/blog/<slug>/`, `/reading`, `/listening`, `/d-sibs`, and `/stock-sell` includes canonical, description, Open Graph image, and title.

Expected outcome: page metadata is owned by `BaseHead`, page defaults are owned by `BaseLayout`, and accepted props are no longer silently ignored.

## Task 2: Extract D-SIBS Domain Logic

**Files:**
- Create: `src/lib/d-sibs.ts`
- Create: `src/lib/__tests__/d-sibs.test.ts`
- Modify: `src/pages/d-sibs.astro`

- [ ] Step 1: Move `BankEntry`, `YearData`, group keys, group labels, type labels, type ordering, `typeClass`, and `typeLabel` into `src/lib/d-sibs.ts`.
- [ ] Step 2: Add a `buildDsibsViewModel(entries)` function that returns `{ years, sortedBanks, yearStats, changes }`.
- [ ] Step 3: Write Vitest coverage for:
  - bank names are de-duplicated across years;
  - banks are sorted by latest group descending, then type order;
  - entered, exited, upgraded, and downgraded changes are detected correctly;
  - missing groups default to an empty list.
- [ ] Step 4: Replace the transformation block in `src/pages/d-sibs.astro` with a call to `buildDsibsViewModel(rawEntries)`.
- [ ] Step 5: Run `bun run test -- src/lib/__tests__/d-sibs.test.ts`.
- [ ] Step 6: Run `bun run build`.

Expected outcome: D-SIBS data behavior can change independently of Astro markup and has regression coverage.

## Task 3: Split D-SIBS Rendering Components

**Files:**
- Create: `src/components/d-sibs/BankHistoryTable.astro`
- Create: `src/components/d-sibs/BankSparkline.astro`
- Create: `src/components/d-sibs/ChangesTimeline.astro`
- Create: `src/components/d-sibs/YearCompositionGrid.astro`
- Modify: `src/pages/d-sibs.astro`

- [ ] Step 1: Move compact sparkline SVG rendering into `BankSparkline.astro` with explicit props: `years`, `history`, and `latestType`.
- [ ] Step 2: Move the table into `BankHistoryTable.astro` with explicit props: `years`, `banks`, `groupLabels`.
- [ ] Step 3: Move year-over-year changes into `ChangesTimeline.astro`.
- [ ] Step 4: Move per-year composition into `YearCompositionGrid.astro`.
- [ ] Step 5: Keep D-SIBS page-level CSS tokens near the page or move them to `src/styles/components.css` only if they become shared.
- [ ] Step 6: Run `bun run build`.
- [ ] Step 7: Manually compare `/d-sibs` before and after using browser screenshots at desktop and mobile widths.

Expected outcome: `src/pages/d-sibs.astro` becomes a composition page, and future D-SIBS UI work can happen in small components.

## Task 4: Harden Sparkline Popover Behavior

**Files:**
- Modify: `src/components/d-sibs/SparklinePopover.astro`
- Optionally create: `src/scripts/sparkline-popover.ts`

- [ ] Step 1: Replace implicit selector-only setup with an exported initializer if moved to `src/scripts/sparkline-popover.ts`.
- [ ] Step 2: Support `focus`, `blur`, `keydown Escape`, and click interactions in addition to hover.
- [ ] Step 3: Make table cells focusable only when a popover is available.
- [ ] Step 4: Keep `aria-hidden` synchronized and add `role="dialog"` or `role="tooltip"` based on final interaction model.
- [ ] Step 5: Guard `JSON.parse` so malformed `data-trajectory` does not throw and break the page script.
- [ ] Step 6: Test `/d-sibs` with mouse, keyboard tabbing, Escape, desktop viewport, and mobile viewport.

Expected outcome: the popover works as an accessible enhancement and does not couple the whole page to a fragile DOM query.

## Task 5: Extract Audio Player

**Files:**
- Create: `src/components/audio/AudioPlayer.astro`
- Create: `src/scripts/audio-player.ts`
- Modify: `src/pages/listening.astro`

- [ ] Step 1: Move the player markup from `src/pages/listening.astro` into `AudioPlayer.astro`.
- [ ] Step 2: Replace inline SVGs with a consistent icon strategy or keep SVGs encapsulated inside the component.
- [ ] Step 3: Move the script at `src/pages/listening.astro:327-399` into `src/scripts/audio-player.ts`.
- [ ] Step 4: Initialize on `DOMContentLoaded` and `astro:after-swap`.
- [ ] Step 5: Make initialization idempotent with a `data-audio-ready` attribute.
- [ ] Step 6: Handle `audio.play()` promise rejection and `audio.duration` being `NaN` before metadata loads.
- [ ] Step 7: Run `bun run build` and manually test play, pause, seek, ended state, and switching between episodes.

Expected outcome: listening page markup is simpler, the player behavior is reusable, and future navigation changes do not break it.

## Task 6: Harden Stock Calculator UI Rendering

**Files:**
- Create: `src/components/stock-sell/StockSellCalculator.astro`
- Create: `src/scripts/stock-sell-calculator.ts`
- Modify: `src/pages/stock-sell.astro`
- Keep: `src/lib/stock-sell-calc.ts`
- Keep: `src/lib/__tests__/stock-sell-calc.test.ts`

- [ ] Step 1: Move calculator markup and local CSS from `src/pages/stock-sell.astro` into `StockSellCalculator.astro`.
- [ ] Step 2: Move DOM behavior from the inline script into `src/scripts/stock-sell-calculator.ts`.
- [ ] Step 3: Replace `alert()` validation with inline error text inside a `role="alert"` element.
- [ ] Step 4: Replace `innerHTML` row rendering with DOM node creation or a controlled template that only inserts text via `textContent`.
- [ ] Step 5: Fix the mismatch where zero dividend returns calculated results in `src/lib/stock-sell-calc.ts`, but the UI empty-result alert says dividend must be greater than zero.
- [ ] Step 6: Remove the unused `profitClass` function if all displayed results remain positive.
- [ ] Step 7: Run `bun run test -- src/lib/__tests__/stock-sell-calc.test.ts`.
- [ ] Step 8: Run `bun run build`.

Expected outcome: the calculator remains static-site friendly but gains safer rendering, clearer validation, and cleaner page composition.

## Task 7: Consolidate Design Primitives

**Files:**
- Create: `src/styles/components.css`
- Modify: `src/components/BaseHead.astro`
- Modify: `src/styles/global.css`
- Modify: `src/styles/markdown.css`
- Modify page/component styles that currently define repeated panels, inputs, cards, chips, and metric styles.

- [ ] Step 1: Keep `src/styles/global.css` focused on tokens, reset, layout primitives, tables, and global link/body behavior.
- [ ] Step 2: Move reusable component classes to `src/styles/components.css`: panel, field, button, tag, pill, metric grid, metric card, responsive media tile.
- [ ] Step 3: Import `components.css` from `BaseHead.astro` after `global.css` and before `markdown.css`.
- [ ] Step 4: Replace repeated page-local panel/card/input styles in `stock-sell` and `d-sibs` with the shared primitives where the visual result is equivalent.
- [ ] Step 5: Remove stale Starlight selectors from `markdown.css` and replace `var(--__sl-font-mono)` with `var(--z-font-mono)`.
- [ ] Step 6: Run `bun run build`.
- [ ] Step 7: Check `/blog/<slug>` with code blocks, tables, blockquotes, details, and headings.

Expected outcome: the design system becomes executable CSS, not only documentation, while page-specific data colors stay local and meaningful.

## Task 8: Update Project Documentation

**Files:**
- Modify: `README.md`
- Optionally modify: `DESIGN.md`

- [ ] Step 1: Replace the Astro starter README with project-specific documentation.
- [ ] Step 2: Document required tooling: Bun, `bun install`, `bun run dev`, `bun run build`, `bun run test`.
- [ ] Step 3: Document content collections: `blog`, `book`, `podcast`, `dsibs`.
- [ ] Step 4: Document architecture conventions:
  - pages compose;
  - `src/lib` owns pure logic;
  - `src/components` owns markup;
  - `src/scripts` owns browser behavior;
  - `src/styles` owns tokens and reusable primitives.
- [ ] Step 5: Link `DESIGN.md` as the design-system reference.

Expected outcome: future contributors see the real architecture instead of the starter template.

## Suggested Execution Order

1. Task 1: low-risk cleanup that clarifies layout/head ownership.
2. Task 2: highest leverage, because D-SIBS domain logic currently has no tests.
3. Task 3: structural split after data behavior is covered.
4. Task 4: accessibility hardening for the extracted D-SIBS interaction.
5. Task 6: stock calculator hardening, because calculation tests already exist.
6. Task 5: audio extraction, independent of calculator and D-SIBS.
7. Task 7: CSS consolidation after component boundaries are clearer.
8. Task 8: docs update after conventions are real.

## Verification Checklist

- [ ] `bun run test`
- [ ] `bun run build`
- [ ] Manual desktop check: `/`, `/blog/<slug>/`, `/reading`, `/listening`, `/d-sibs`, `/stock-sell`
- [ ] Manual mobile check: `/listening`, `/d-sibs`, `/stock-sell`
- [ ] Keyboard check: header menu, D-SIBS popover, stock calculator form, audio controls
- [ ] Metadata check: canonical URL, title, description, Open Graph image on main page types
- [ ] Visual regression check against `DESIGN.md`: flat editorial/data-tool style, restrained accents, readable dense tables

