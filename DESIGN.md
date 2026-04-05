# Design System: shuzhi.zone

## Overview

A minimal, content-first editorial system for technical writing and data-heavy tools.  
The visual tone is calm, precise, and low-noise: monochrome foundations, hairline borders, and restrained semantic accents.

This system prioritizes:
- Long-form readability over decorative UI
- Tokenized light/dark behavior (`color-scheme: light dark`, `light-dark(...)`)
- Dense but scannable information layouts for tables, lists, and calculators
- Consistent visual language across writing, reading, listening, and finance/data pages

## Colors

- **Primary** (`#2860ff`): Links, active states, and key interactive accents (`--z-color-accent`)
- **Secondary** (`#6e7282`): Secondary text, metadata, and supportive UI copy (`--z-color-gray-3`)
- **Tertiary** (`#21b985`): Positive/result semantic highlight in data contexts (e.g., profit/entry states)
- **Neutral** (`#ffffff` / `#1a1e29`): Main surfaces and text inversion baseline (`--z-color-black`, `--z-color-white`)

Core neutral ramp (used broadly across the app):
- `--z-color-gray-1`: `#232a39` (light mode), `#edf0f4` (dark mode)
- `--z-color-gray-2`: `#353d4d` (light), `#c1c4ca` (dark)
- `--z-color-gray-3`: `#58606d` (light), `#888b94` (dark)
- `--z-color-gray-4`: `#888b94` (light), `#58606d` (dark)
- `--z-color-gray-5`: `#c1c4ca` (light), `#353d4d` (dark)
- `--z-color-gray-6`: `#edf0f4` (light), `#232a39` (dark)

Supporting semantic families:
- Orange / Green / Blue / Purple / Red (`--z-color-*-high|base|low`) for contextual emphasis
- Data pages define local semantic tokens (`--yield-*`, `--profit-*`, `--g*`, `--t-*`) for status and categorization

## Typography

- **Headline Font**: IBM Plex Mono
- **Body Font**: IBM Plex Mono + LXGW WenKai
- **Label Font**: IBM Plex Mono

Typography is mono-forward and technical, with WenKai improving CJK readability.

Scale:
- `12px` (`--z-text-2xs`) through `52px` (`--z-text-6xl`)
- Body baseline around `14–16px`
- Headings mainly `20–32px` depending on page/layout

Weights and usage:
- Headline/title: `600–700`
- Body/meta: `400–500`
- Labels/chips/table headers: `600`

Rhythm:
- Body line-height: `1.6875`
- Tightened tracking on major titles (`letter-spacing: -0.01em` to `-0.02em`)
- Tabular numbers for numeric tables (`font-variant-numeric: tabular-nums`)

## Elevation

This design is mostly flat. Depth is primarily conveyed by border contrast and surface separation, not heavy shadows.

- Default structure: `1px` hairline borders and row dividers
- Hover depth: subtle row background shifts in dense tables/lists
- Elevated exception: popover overlays (e.g., sparkline popover) use a single soft shadow:
  - `box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12)`

## Components

- **Buttons**: Minimal, mostly sharp corners; primary action relies on text/background inversion and subtle hover opacity changes.
- **Inputs**: 1px border, compact vertical rhythm, tokenized backgrounds/text, clear focus border changes.
- **Cards**: Flat panels with 1px border; used for summaries, formulas, and grouped data modules.
- **Tables**: Dense data-first styling; uppercase micro-headers, tabular numeric alignment, horizontal overflow wrappers.
- **Tags/Chips/Pills**: Small-radius semantic indicators for type, group, yield, and status states.
- **Navigation**: Sticky top bar with mobile hamburger, switching to inline nav at tablet/desktop breakpoints.
- **TOC**: Mobile collapsible details + desktop sticky sidebar (`1200px+`) with active-section tracking.
- **Media Cells**:
  - Reading covers: framed aspect-ratio tiles
  - Listening episodes: custom compact audio controls with progress track

## Do's and Don'ts

- Do use existing `--z-*` tokens before introducing new visual constants.
- Do keep hierarchy typographic and structural (size/weight/spacing/border), not decorative.
- Do preserve high readability in dense UIs (tabular numbers, clear alignment, restrained accents).
- Do keep semantic colors meaningful (profit/loss/group/type), not ornamental.

- Don’t add heavy gradients, blurred glass effects, or large soft shadows.
- Don’t mix unrelated corner styles in one view; default to sharp/simple geometry.
- Don’t overload screens with too many accent colors at once.
- Don’t break contrast standards for body text and interactive states.
