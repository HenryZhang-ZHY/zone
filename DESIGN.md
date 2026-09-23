---
version: alpha
name: Zone
description: Zone's design system, using Vercel-compatible token definitions with mono-forward typography, sharp geometry, and restrained electric accents.
colors:
  # Zone semantic anchors on top of the Vercel-compatible scale.
  primary: "#213547"
  secondary: "#374151"
  tertiary: "#0095FF"
  neutral: "#f2f2f2"
  background-100: "#ffffff"
  background-200: "#faf7f5"
  gray-100: "#f2f2f2"
  gray-200: "#ebebeb"
  gray-300: "#e6e6e6"
  gray-400: "#eaeaea"
  gray-500: "#c9c9c9"
  gray-600: "#a8a8a8"
  gray-700: "#8f8f8f"
  gray-800: "#7d7d7d"
  gray-900: "#4d4d4d"
  gray-1000: "#171717"
  gray-alpha-100: "#0000000d"
  gray-alpha-200: "#00000015"
  gray-alpha-300: "#0000001a"
  gray-alpha-400: "#00000014"
  gray-alpha-500: "#00000036"
  gray-alpha-600: "#0000003d"
  gray-alpha-700: "#00000070"
  gray-alpha-800: "#00000082"
  gray-alpha-900: "#000000b3"
  gray-alpha-1000: "#000000e8"
  blue-100: "#f0f7ff"
  blue-200: "#e9f4ff"
  blue-300: "#dfefff"
  blue-400: "#cae7ff"
  blue-500: "#94ccff"
  blue-600: "#48aeff"
  blue-700: "#0095FF"
  blue-800: "#0077CC"
  blue-900: "#005FA3"
  blue-1000: "#002359"
  red-100: "#ffeeef"
  red-200: "#ffe8ea"
  red-300: "#ffe3e4"
  red-400: "#ffd7d6"
  red-500: "#ffb1b3"
  red-600: "#ff676d"
  red-700: "#ED3C50"
  red-800: "#C7283A"
  red-900: "#A91F30"
  red-1000: "#47000c"
  amber-100: "#fff6de"
  amber-200: "#fff4cf"
  amber-300: "#fff1c1"
  amber-400: "#ffdc73"
  amber-500: "#ffc543"
  amber-600: "#ffa600"
  amber-700: "#FFC517"
  amber-800: "#D9A000"
  amber-900: "#aa4d00"
  amber-1000: "#561900"
  green-100: "#ecfdec"
  green-200: "#e5fce7"
  green-300: "#d3fad1"
  green-400: "#b9f5bc"
  green-500: "#82eb8d"
  green-600: "#4ce15e"
  green-700: "#28a948"
  green-800: "#279141"
  green-900: "#107d32"
  green-1000: "#003a00"
  teal-100: "#defffb"
  teal-200: "#ddfef6"
  teal-300: "#ccf9f1"
  teal-400: "#b1f7ec"
  teal-500: "#52f0db"
  teal-600: "#00e3c4"
  teal-700: "#00ac96"
  teal-800: "#00927f"
  teal-900: "#007f70"
  teal-1000: "#003f34"
  purple-100: "#faf0ff"
  purple-200: "#f9f0ff"
  purple-300: "#f6e8ff"
  purple-400: "#f2d9ff"
  purple-500: "#dfa7ff"
  purple-600: "#c979ff"
  purple-700: "#a000f8"
  purple-800: "#8500d1"
  purple-900: "#7d00cc"
  purple-1000: "#2f004e"
  pink-100: "#ffe8f6"
  pink-200: "#ffe8f3"
  pink-300: "#ffdfeb"
  pink-400: "#ffd3e1"
  pink-500: "#fdb3cc"
  pink-600: "#f97ea7"
  pink-700: "#f22782"
  pink-800: "#e4106e"
  pink-900: "#c41562"
  pink-1000: "#460523"
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
    narrow: 1100px
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
    backgroundColor: "{colors.blue-800}"
    textColor: "{colors.background-100}"
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
    border: "1px solid {colors.gray-300}"
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
    border: "1px solid {colors.gray-500}"
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
    backgroundColor: "rgba(255, 255, 255, 0.45)"
    textColor: "{colors.primary}"
    typography: "{typography.copy-16}"
    rounded: "{rounded.subtle}"
    padding: "{spacing.8}"
    border: "1px solid {colors.gray-alpha-200}"
---

# Zone

## Overview

Zone uses Vercel's design-token vocabulary and scale structure, then applies a small set of brand-specific overrides: brand navy for primary text, electric blue for interaction, coral red for destructive or error states, IBM Plex Mono with LXGW WenKai for the mono-forward CJK-aware voice, and sharp corners on major UI.

Treat the frontmatter tokens as the design source of truth. The implementation maps these ideas into CSS variables in `src/styles/global.css`; `BaseLayout`, `.z-main`, `SiteIdentity`, and `Footer` share page-shell tokens for alignment.

## Colors

The color system follows Vercel's scale model. Each non-background scale runs 10 steps (`100`-`1000`), and the step encodes intent:

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

Zone keeps the same token names but changes the key semantic anchors. `primary` is Brand Navy (`#213547`), `secondary` is Medium Gray (`#374151`), and `tertiary` is Electric Blue (`#0095FF`). Use `background-100` for the page and card surface; use `background-200` as the warm secondary surface. `gray-alpha-*` tokens are translucent and layer well over any surface, so prefer them for subtle borders, dividers, hover fills, and overlays.

Accent meaning stays strict: `blue-700`/`tertiary` is the brand accent and focus/checked state; `red-700`/`red-800` is for errors and destructive actions; `amber-700` is for warnings. Keep decorative color rare.

For text on light surfaces, use the darker `blue-900` via `--z-color-text-accent`; keep `blue-700` for non-text accents and focus indicators. For small white button labels, use `blue-800` as the fill so the label has sufficient contrast. Give inline article links an underline so they remain recognizable without color. Long-form article content, including its headings, shares a 72ch maximum measure with `copy-16` and relaxed leading; compact metadata should not drop below `label-13` where space permits.

## Typography

Zone reuses Vercel's typography token set and metrics, but replaces the font family with the Zone stack:

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

- `narrow` and `medium`: the same 1100px outer shell for writing, reading, listening, utility, and data pages, so site identity, content origin, and footer do not shift on navigation.
- `wide`: 1278px for broad layouts.
- `article`: the same 1100px outer shell with a centered `72ch` reading column. Writing, reading recents, and listening lists use that same centered column and align the site identity to it. The desktop table of contents floats to its right without moving the reading column; the title, divider, and body share its center line.

Header/site identity, main content, and footer must consume `--z-page-max-width` and `--z-page-pad-x`. Do not duplicate the reading-width token or horizontal padding in component-local CSS.

## Elevation & Depth

Hierarchy should come from typography, whitespace, surfaces, and borders before shadows. Most Zone components use no shadow. When depth is needed, keep it soft:

- Raised cards: `0 1px 2px rgba(0, 0, 0, 0.05)`
- Floating panels: `0 4px 8px rgba(0, 0, 0, 0.08)`
- Modals and overlays: `0 12px 24px rgba(0, 0, 0, 0.12)`

Prefer a subtle border over a shadow. Avoid combining both unless a floating element needs clear separation.

## Motion

Use motion only when it clarifies a change. Same-origin page navigation uses a 180ms cross-fade in browsers supporting cross-document view transitions, with an instant fallback and no animation when reduced motion is preferred. Most hover and active states should be instant color, underline, or border changes. When motion helps, keep it short: roughly 120-150ms for controls, 180-220ms for menus and popovers, and up to 300ms for overlays. The shared `--z-ease-out` token is `cubic-bezier(0.23, 1, 0.32, 1)` for deliberate entrances and exits.

## Shapes

The `rounded` section keeps Vercel's `sm`, `md`, `lg`, and `full` tokens, with Zone-specific `none` and `subtle` aliases for brand-critical surfaces. Use `rounded.none` for buttons, navigation, and major structural UI. Use `rounded.subtle` for cards, inputs, checkboxes, and table wrappers. Do not use large rounded corners or pills unless the component has a documented exception.

## Components

The `components` tokens preserve Vercel's component shape while applying Zone's key style decisions:

- Primary button: deeper electric-blue fill, white text, 40px height, sharp corners.
- Secondary button: white fill, brand-navy text, subtle gray border, sharp corners.
- Tertiary button: transparent, brand-navy text, sharp corners, subtle hover fill.
- Error button: coral-red fill with white text, reserved for destructive actions.
- Inputs: white surface, brand-navy text, 3px radius, gray border, electric-blue focus border.
- Translucent cards: white at 45% opacity, brand-navy text, subtle border, 3px radius.

Hover and active states should step through the relevant scale: blue primary actions move from `blue-800` to `blue-900` to `blue-1000` to retain contrast with white labels; borders move from `gray-400` to `gray-500` to `gray-600`; subtle fills use `gray-alpha-*`. Disabled controls use a pale neutral fill, `gray-700` text, and a not-allowed cursor. Focus must stay visible on every interactive element.

## Responsive Behavior

Design mobile-first, then expand layout complexity:

- Mobile (`320px-599px`): one column, 16px page padding, 40px section gaps, and minimum 44px touch targets.
- Tablet (`600px-1023px`): up to two columns, 24px page padding, and 64px section gaps.
- Desktop (`1024px-1439px`): full navigation, selected page shell width, and 64-96px major section gaps.
- Wide (`1440px+`): center content in the selected `pageLayout` width with balanced side margins.

Collapse grids from 3 columns to 2 to 1. Page padding should move from 32px to 24px to 16px. Article pages and editorial lists share the same centered reading-column origin and measure; the desktop table of contents sits to the right without shifting that column.

## Voice & Content

Copy is part of the interface. Keep it direct, specific, and calm. Use action labels with verbs and nouns (`Export Data`, `Delete Rule`), not generic labels like `OK` or `Confirm`. Error copy should state what happened and what the user can do next. Loading states use the present participle with an ellipsis, such as `Saving…`.

Use numerals for counts and measurements. Keep body copy sentence case; use title case only for concise labels, navigation, buttons, and page titles. Avoid marketing superlatives and filler.

## Do's and Don'ts

- Use Vercel-compatible token names for colors, typography, spacing, and rounded values.
- Keep Zone's key overrides: Brand Navy primary text, Electric Blue interaction, Coral Red errors, IBM Plex Mono/LXGW WenKai typography, and sharp major UI.
- Use the gray scale to rank information: primary text, secondary text, disabled text, borders, and subtle fills should come from the scale.
- Apply typography tokens instead of hand-setting font size, line height, or weight.
- Use `.z-main`, `pageLayout`, `--z-page-max-width`, and `--z-page-pad-x` for shell alignment.
- Show a visible focus treatment on every interactive element.
- Do not introduce unrelated type stacks without documenting the exception.
- Do not use custom colors outside the token palette.
- Do not duplicate layout formulas across component CSS.
- Do not signal state with color alone.

## Agent Prompt Guide

When generating or reviewing UI for Zone:

1. Start from the Vercel-compatible token names in this file.
2. Preserve Zone's key style overrides: `primary`, `secondary`, `tertiary`, `fontFamilies`, `rounded.none`, and `rounded.subtle`.
3. Use `copy-16`, `copy-14`, `label-14`, and `button-14` for most UI.
4. Use the spacing scale only: 8px for tight groups, 16px for related items, 24-32px for component and grid gaps, and 40-64px for sections.
5. Use contrast-safe blue for primary actions and electric blue for focus; use coral red only for destructive or error states.
6. Keep major controls sharp and subtle containers at 3px.
7. Preserve shared page-shell alignment through `BaseLayout`, `.z-main`, `SiteIdentity`, and `Footer`.
8. Check responsive collapse: 3 columns to 2 to 1, page padding 32px to 24px to 16px, and touch targets at least 44px on mobile.
