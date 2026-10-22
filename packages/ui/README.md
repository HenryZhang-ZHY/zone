# @zone/ui

Hairline's Tailwind layer, prose styles and Astro components.

```astro
---
import '@zone/ui/styles.css'
import SiteHeader from '@zone/ui/components/SiteHeader.astro'
import Entry from '@zone/ui/components/Entry.astro'
---
```

## What is in the package

```
src/
  styles/
    index.css        Tailwind import, @theme mapping, shell/focus/duration utilities
    base.css         Document reset, language stacks, focus, selection, motion
    primitives.css   .z-table / .z-input / .z-field / .z-checkbox (Tailwind @apply)
    prose.css        .z-prose, numbered sections, CJK reading, footnotes
    fonts.css        IBM Plex Mono + Newsreader, Latin only
  components/        One .astro file per component
  recipes/
    tv.ts            createTV() with the Zone type scale registered for tailwind-merge
    cn.ts            merge component classes with caller overrides
    merge-config.ts  The custom text-* sizes that tailwind-merge must know
```

## Consumption

- Import `@zone/ui/styles.css` once at the page layout.
- Import components by path: `@zone/ui/components/Entry.astro`.
- The stylesheet scans the package's components and recipes via `@source`, so class names written in `tv()` are not purged.
- Apps still need the Tailwind Vite plugin (`@tailwindcss/vite`) in their Astro config. The stylesheet imports `tailwindcss`; the plugin compiles it.

## Recipes

```ts
import { tv } from "../recipes/tv";
import { cn } from "../recipes/cn";

const entry = tv({
  slots: {
    root: "border-b border-line",
    title: "text-heading-20 font-semibold text-ink",
  },
});

const styles = entry();
// styles.title() → string
```

Two things are easy to get wrong:

1. With `slots`, calling `tv({...})` returns **functions** for each slot. Call them: `styles.title()`. If a class attribute contains a function source, this is why.
2. `tailwind-merge` does not know the custom type scale by default. It would read `text-heading-40` and `text-ink` as two colors and drop one. Use `recipes/tv.ts` and `recipes/cn.ts`, never `tailwind-variants` directly.

## Boundaries

- No page widths, gutters or `max-width` formulas in components.
- No raw colors, px outside the scale, or inline durations.
- No business copy. Components receive words through slots.
- Tables and forms are element primitives, not components; their recipes are in `primitives.css`.
- The prose layer is intentionally custom CSS: rendered Markdown cannot carry utility classes.
