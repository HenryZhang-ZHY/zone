---
version: alpha
name: Zone
description: Zone's dark design system, using Vercel-compatible token definitions with mono-forward typography, sharp geometry, and restrained electric accents.
colors:
  # Zone semantic anchors on top of the Vercel-compatible dark scale.
  primary: "#E5E7EB"
  secondary: "#9CA3AF"
  tertiary: "#0095FF"
  neutral: "#1a1a1a"
  background-100: "#111827"
  background-200: "#1F2937"
  gray-100: "#1a1a1a"
  gray-200: "#1f1f1f"
  gray-300: "#292929"
  gray-400: "#2e2e2e"
  gray-500: "#454545"
  gray-600: "#878787"
  gray-700: "#8f8f8f"
  gray-800: "#7d7d7d"
  gray-900: "#a0a0a0"
  gray-1000: "#ededed"
  gray-alpha-100: "#ffffff12"
  gray-alpha-200: "#ffffff17"
  gray-alpha-300: "#ffffff21"
  gray-alpha-400: "#ffffff24"
  gray-alpha-500: "#ffffff3d"
  gray-alpha-600: "#ffffff82"
  gray-alpha-700: "#ffffff8a"
  gray-alpha-800: "#ffffff78"
  gray-alpha-900: "#ffffff9c"
  gray-alpha-1000: "#ffffffeb"
  blue-100: "#06193a"
  blue-200: "#022248"
  blue-300: "#002f62"
  blue-400: "#003674"
  blue-500: "#00418b"
  blue-600: "#48AEFF"
  blue-700: "#0095FF"
  blue-800: "#0077CC"
  blue-900: "#47A8FF"
  blue-1000: "#eaf6ff"
  red-100: "#330a11"
  red-200: "#440d13"
  red-300: "#5d0e17"
  red-400: "#6f101b"
  red-500: "#88151f"
  red-600: "#F56B78"
  red-700: "#ED3C50"
  red-800: "#C7283A"
  red-900: "#FF6B78"
  red-1000: "#ffe9ed"
  amber-100: "#2a1700"
  amber-200: "#361900"
  amber-300: "#502800"
  amber-400: "#5b3000"
  amber-500: "#703e00"
  amber-600: "#ed9a00"
  amber-700: "#FFC517"
  amber-800: "#D9A000"
  amber-900: "#ff9300"
  amber-1000: "#fff3d5"
  green-100: "#002608"
  green-200: "#00320b"
  green-300: "#003a0e"
  green-400: "#004615"
  green-500: "#006717"
  green-600: "#00952d"
  green-700: "#00ac3a"
  green-800: "#009432"
  green-900: "#00ca50"
  green-1000: "#d8ffe4"
  teal-100: "#00231b"
  teal-200: "#002b22"
  teal-300: "#003d34"
  teal-400: "#004035"
  teal-500: "#006354"
  teal-600: "#009e86"
  teal-700: "#00aa95"
  teal-800: "#00927f"
  teal-900: "#00cfb7"
  teal-1000: "#cbfff5"
  purple-100: "#290c33"
  purple-200: "#341142"
  purple-300: "#47185e"
  purple-400: "#541a76"
  purple-500: "#642290"
  purple-600: "#9440d5"
  purple-700: "#9440d5"
  purple-800: "#7d2bba"
  purple-900: "#c472fb"
  purple-1000: "#fbecff"
  pink-100: "#310d1e"
  pink-200: "#420c25"
  pink-300: "#571032"
  pink-400: "#5d0c34"
  pink-500: "#76063f"
  pink-600: "#ba0056"
  pink-700: "#f12b82"
  pink-800: "#e7006d"
  pink-900: "#ff4d8d"
  pink-1000: "#ffe9f4"
fontFamilies:
  sans: "'IBM Plex Mono', 'LXGW WenKai', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  mono: "'IBM Plex Mono', 'LXGW WenKai', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
typography:
  heading-72:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 72px
    fontWeight: 600
    lineHeight: 72px
    letterSpacing: -4.32px
  heading-64:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 64px
    fontWeight: 600
    lineHeight: 64px
    letterSpacing: -3.84px
  heading-56:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 56px
    letterSpacing: -3.36px
  heading-48:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 48px
    fontWeight: 600
    lineHeight: 56px
    letterSpacing: -2.88px
  heading-40:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 48px
    letterSpacing: -2.4px
  heading-32:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: -1.28px
  heading-24:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: -0.96px
  heading-20:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 26px
    letterSpacing: -0.4px
  heading-16:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.32px
  heading-14:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: -0.28px
  button-16:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 20px
  button-14:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  button-12:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
  label-20:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 32px
  label-18:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 20px
  label-16:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 20px
  label-14:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  label-14-mono:
    fontFamily: "{fontFamilies.mono}"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  label-13:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 16px
  label-13-mono:
    fontFamily: "{fontFamilies.mono}"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
  label-12:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-12-mono:
    fontFamily: "{fontFamilies.mono}"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  copy-24:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 36px
  copy-20:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 36px
  copy-18:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
  copy-16:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  copy-14:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  copy-14-mono:
    fontFamily: "{fontFamilies.mono}"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  copy-13:
    fontFamily: "{fontFamilies.sans}"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
  copy-13-mono:
    fontFamily: "{fontFamilies.mono}"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  6: 24px
  8: 32px
  10: 40px
  16: 64px
  24: 96px
  base: 4px
rounded:
  none: 0px
  subtle: 3px
  sm: 6px
  md: 12px
  lg: 16px
  full: 9999px
layout:
  page:
    narrow: 960px
    medium: 1100px
    wide: 1278px
    articleContent: "clamp(45rem, 58vw, 56rem)"
    articleSideColumn: "clamp(10rem, 12vw, 16rem)"
    articleColumnGap: 32px
  pagePadding:
    desktop: "{spacing.8}"
    tablet: "{spacing.6}"
    mobile: "{spacing.4}"
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "#ffffff"
    typography: "{typography.button-14}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: 40px
  button-secondary:
    backgroundColor: "{colors.background-100}"
    textColor: "{colors.primary}"
    typography: "{typography.button-14}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: 40px
    border: "1px solid {colors.gray-alpha-400}"
  button-tertiary:
    textColor: "{colors.primary}"
    typography: "{typography.button-14}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: 40px
  button-error:
    backgroundColor: "{colors.red-800}"
    textColor: "#ffffff"
    typography: "{typography.button-14}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: 40px
  button-small:
    typography: "{typography.button-14}"
    rounded: "{rounded.none}"
    padding: "0 6px"
    height: 32px
  button-large:
    typography: "{typography.button-16}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: 48px
  input:
    backgroundColor: "{colors.background-100}"
    textColor: "{colors.primary}"
    typography: "{typography.label-14}"
    rounded: "{rounded.subtle}"
    padding: "0 12px"
    height: 40px
    border: "1px solid {colors.gray-alpha-400}"
    focusBorder: "2px solid {colors.tertiary}"
  input-small:
    typography: "{typography.label-14}"
    rounded: "{rounded.subtle}"
    padding: "0 12px"
    height: 32px
  input-large:
    typography: "{typography.label-16}"
    rounded: "{rounded.subtle}"
    padding: "0 12px"
    height: 48px
  card-translucent:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.primary}"
    typography: "{typography.copy-16}"
    rounded: "{rounded.subtle}"
    padding: "{spacing.8}"
    border: "1px solid {colors.gray-alpha-200}"
---

# Zone

## Overview

Zone Dark uses the same Vercel-compatible token vocabulary as the light theme, then remaps the values for a deep, low-glare interface. The theme keeps Zone's key overrides: pale text on deep navy surfaces, electric blue for interaction, coral red for destructive or error states, IBM Plex Mono with LXGW WenKai for the mono-forward CJK-aware voice, and sharp corners on major UI.

This is the Dark theme. The Light theme uses the same token names with different values and lives at `/DESIGN.md`. The implementation maps these ideas into CSS variables in `src/styles/global.css`; `BaseLayout`, `.z-main`, `SiteIdentity`, and `Footer` share page-shell tokens for alignment.

## Colors

The color system follows Vercel's dark scale model. Each non-background scale runs 10 steps (`100`-`1000`), and the step encodes intent:

- `100` default background
- `200` hover background
- `300` active background
- `400` default border
- `500` hover border
- `600` active border
- `700` solid fill, high contrast
- `800` solid fill, hover
- `900` secondary text and icons
- `1000` primary text and icons

Zone keeps the same token names but changes the key semantic anchors for dark mode. `primary` is Pale Gray (`#E5E7EB`), `secondary` is Light Gray (`#9CA3AF`), and `tertiary` remains Electric Blue (`#0095FF`). Use `background-100` for the primary page surface and `background-200` for muted panels, sidebars, and cards that need subtle separation. `gray-alpha-*` tokens are translucent light overlays, so they layer well over dark surfaces for borders, dividers, hover fills, and overlays.

Accent meaning stays strict: `blue-700`/`tertiary` is the primary CTA, link hover, active navigation, focus, and checked state; `red-700`/`red-800` is for errors and destructive actions; `amber-700` is for warnings. Keep decorative color rare so the dark theme stays calm and readable.

## Typography

Zone Dark reuses Vercel's typography token set and metrics, but replaces the font family with the Zone stack:

`'IBM Plex Mono', 'LXGW WenKai', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`

Use the `typography` tokens above instead of setting font size, line height, weight, or letter spacing by hand:

- Headings, `heading-72` through `heading-14`, title pages, articles, sections, and dense subsection labels.
- Labels, `label-20` through `label-12`, carry single-line scannable UI text: navigation, form labels, table headers, and metadata.
- Copy, `copy-24` through `copy-13`, sets multiline body text with comfortable line height.
- Buttons, `button-16` through `button-12`, are medium-weight labels for buttons and compact controls.

For most Zone UI, start with `copy-16` for body text, `copy-14` for dense copy, `label-14` for metadata and navigation, and `button-14` for controls. The `-mono` variants intentionally keep the same font stack because Zone is mono-forward by default.

## Layout

Spacing reuses Vercel's 4px scale: 4, 8, 12, 16, 24, 32, 40, 64, and 96px. Keep the rhythm simple: 8px inside tight groups, 16px between related items, 24-32px for card padding and grid gaps, and 40-64px between sections. Use 96px only for hero-scale separation.

`BaseLayout` owns the page shell through `pageLayout`. Page content should use `.z-main` rather than local max-width rules:

- `narrow`: 960px for articles and focused pages.
- `medium`: 1100px for utility and data pages.
- `wide`: 1278px for broad layouts.
- `article`: a centered `clamp(45rem, 58vw, 56rem)` content column with symmetrical side columns for desktop table-of-contents space.

Header/site identity, main content, and footer must consume `--z-page-max-width` and `--z-page-pad-x`. Do not duplicate container widths, article TOC math, or horizontal padding in component-local CSS.

## Elevation & Depth

Hierarchy should come from typography, whitespace, tonal surfaces, and translucent borders before shadows. Most Zone Dark components use no shadow. When depth is needed, keep it soft:

- Raised cards: `0 1px 2px rgba(0, 0, 0, 0.16)`
- Floating panels: `0 4px 8px rgba(0, 0, 0, 0.18)`
- Modals and overlays: `0 12px 24px rgba(0, 0, 0, 0.22)`

Prefer a translucent border over a shadow. Avoid combining both unless a floating element needs clear separation from a similarly dark surface.

## Motion

Use motion only when it clarifies a change. Most hover and active states should be instant color, underline, border, or translucent fill changes. When motion helps, keep it short: roughly 120-150ms for controls, 180-220ms for menus and popovers, and up to 300ms for overlays. Honor `prefers-reduced-motion` by removing nonessential animation.

## Shapes

The `rounded` section keeps Vercel's `sm`, `md`, `lg`, and `full` tokens, with Zone-specific `none` and `subtle` aliases for brand-critical surfaces. Use `rounded.none` for buttons, navigation, and major structural UI. Use `rounded.subtle` for cards, inputs, checkboxes, and table wrappers. Do not use large rounded corners or pills unless the component has a documented exception.

## Components

The `components` tokens preserve Vercel's component shape while applying Zone's dark-theme style decisions:

- Primary button: electric-blue fill, white text, 40px height, sharp corners.
- Secondary button: dark surface fill, pale text, translucent border, sharp corners.
- Tertiary button: transparent, pale text, sharp corners, subtle translucent hover fill.
- Error button: coral-red fill with white text, reserved for destructive actions.
- Inputs: dark surface, pale text, 3px radius, translucent border, electric-blue focus border.
- Translucent cards: white at 5% opacity, pale text, translucent border, 3px radius.

Hover and active states should step through the relevant scale: blue primary actions move from `blue-700` to `blue-800` and use `blue-900` for high-visibility focus or text; borders move from `gray-alpha-300` to `gray-alpha-400` to `gray-alpha-500`; subtle fills use `gray-alpha-*`. Disabled controls use `gray-100` fill, `gray-700` text, and a not-allowed cursor. Focus must stay visible on every interactive element; use an electric-blue ring or border with enough contrast against `background-100`.

## Responsive Behavior

Design mobile-first, then expand layout complexity:

- Mobile (`320px-599px`): one column, 16px page padding, 40px section gaps, and minimum 44px touch targets.
- Tablet (`600px-1023px`): up to two columns, 24px page padding, and 64px section gaps.
- Desktop (`1024px-1439px`): full navigation, selected page shell width, and 64-96px major section gaps.
- Wide (`1440px+`): center content in the selected `pageLayout` width with balanced side margins.

Collapse grids from 3 columns to 2 to 1. Page padding should move from 32px to 24px to 16px. Article pages must keep the reading column centered even when a desktop table of contents appears.

## Voice & Content

Copy is part of the interface. Keep it direct, specific, and calm. Use action labels with verbs and nouns (`Export Data`, `Delete Rule`), not generic labels like `OK` or `Confirm`. Error copy should state what happened and what the user can do next. Loading states use the present participle with an ellipsis, such as `Saving…`.

Use numerals for counts and measurements. Keep body copy sentence case; use title case only for concise labels, navigation, buttons, and page titles. Avoid marketing superlatives and filler.

## Do's and Don'ts

- Use Vercel-compatible token names for colors, typography, spacing, and rounded values.
- Keep Zone's dark-theme overrides: Pale Gray primary text, Electric Blue interaction, Coral Red errors, IBM Plex Mono/LXGW WenKai typography, deep navy surfaces, and sharp major UI.
- Use the gray scale and `gray-alpha-*` overlays to rank information, borders, disabled states, and subtle fills.
- Apply typography tokens instead of hand-setting font size, line height, or weight.
- Use `.z-main`, `pageLayout`, `--z-page-max-width`, and `--z-page-pad-x` for shell alignment.
- Show a visible focus treatment on every interactive element.
- Do not introduce unrelated type stacks without documenting the exception.
- Do not use custom colors outside the token palette.
- Do not duplicate layout formulas across component CSS.
- Do not signal state with color alone.

## Agent Prompt Guide

When generating or reviewing dark UI for Zone:

1. Start from the Vercel-compatible token names in this file.
2. Preserve Zone's key dark style overrides: `primary`, `secondary`, `tertiary`, `background-100`, `background-200`, `fontFamilies`, `rounded.none`, and `rounded.subtle`.
3. Use `copy-16`, `copy-14`, `label-14`, and `button-14` for most UI.
4. Use the spacing scale only: 8px for tight groups, 16px for related items, 24-32px for component and grid gaps, and 40-64px for sections.
5. Use electric blue for primary interactions and focus; use coral red only for destructive or error states.
6. Keep major controls sharp and subtle containers at 3px.
7. Preserve shared page-shell alignment through `BaseLayout`, `.z-main`, `SiteIdentity`, and `Footer`.
8. Check responsive collapse: 3 columns to 2 to 1, page padding 32px to 24px to 16px, and touch targets at least 44px on mobile.
