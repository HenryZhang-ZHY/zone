# Foundations

## Color

The page is **pure white**. The ink is a cool blue-black. The neutral scale is a near-neutral gray with the same cool cast. Nothing is tinted, nothing is pure black, and the accent is the only saturated color.

### Semantic tokens

| Token                                         | Role                                             |
| --------------------------------------------- | ------------------------------------------------ |
| `canvas`                                      | The page: `#FFFFFF`                              |
| `surface`                                     | Notes, code, quiet blocks                        |
| `surface-strong`                              | Pressed and disabled fills                       |
| `ink`                                         | Headings and primary text                        |
| `ink-secondary`                               | Body text                                        |
| `ink-tertiary`                                | Metadata, AA on white                            |
| `ink-quiet`                                   | Decorative only; never body text                 |
| `line` / `line-strong`                        | Hairlines and section rules                      |
| `accent` / `accent-strong` / `accent-soft`    | Links, actions, selection                        |
| `signal`                                      | The current section, the current navigation item |
| `positive` / `warning` / `danger` (+ `-soft`) | State only                                       |
| `data-1` … `data-5`                           | Chart series                                     |

`ink-tertiary` is the lowest text tone allowed for information. `ink-quiet` is for rules, disabled decoration and the inactive edge ticks.

### Dark theme

The same semantic names resolve through `light-dark()`. The dark canvas is near-black, the ink cools and softens, and the accent gets lighter to keep its contrast. It is a second set of values, not an inversion.

```css
--z-color-canvas: light-dark(#ffffff, #0b0e11);
```

### Contrast (light)

| Pair                        |                 Ratio |
| --------------------------- | --------------------: |
| `ink` on `canvas`           |                  18.5 |
| `ink-secondary` on `canvas` |                  10.2 |
| `ink-tertiary` on `canvas`  |                   5.6 |
| `accent` on `canvas`        |                   6.0 |
| `signal` on `canvas`        |                   3.8 |
| `ink-quiet` on `canvas`     | 3.2 (decorative only) |

## Typography

| Stack                      | Token         | Use                                                                                            |
| -------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| IBM Plex Mono              | `ui` / `code` | Labels, dates, navigation, numbers, code; the apparatus                                        |
| Newsreader Variable        | `serif`       | Article titles, ledes, body, entry titles and excerpts, book titles; the default reading voice |
| System sans + platform CJK | `reading`     | Chinese and Japanese prose                                                                     |

The type scale is in `packages/tokens/tokens.json` (`type`). Tailwind exposes every size as `text-{name}` with its line-height and tracking already attached: `text-heading-40`, `text-copy-16`, `text-label-11`, `text-button-14`.

### Rules

- Headings are 600 weight; body is 400.
- Display and heading tracking is negative for Latin and zero for Han characters.
- Serif is the reading voice at 22px. Mono is the apparatus; it never renders prose. There is no reader-facing mode switch.
- Chinese and Japanese resolve prose to the reading stack at 18px / 1.9, with 0.75em block gaps and no heading tracking.
- The reading measure is 78ch of the UI mono. At 22px the serif lands at roughly 81 characters; the previous 68ch at 19px was about 80. A `ch` is the width of the zero, not the average character; the number is a consequence of the column and the face. The 78ch width at 19px would be about 94, which is why the body grew with the column. The archive and listening list keep the 68ch index measure. The measure lab at `/demos/measure/` compares the new default, the previous 68ch/19px, full-bleed and 78ch/19px.
- Metadata never goes below `label-11` where it is information.

## Space

The scale is 4px based: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96. Tailwind exposes them as the usual spacing utilities (`p-4` is 16px).

The rhythm:

- 8px inside a tight group.
- 16px between related items.
- 24–32px for component gaps.
- 40–64px between sections.
- 96px only for a hero-scale break; the article does not use it inside the prose.

## Layout

- **Shell**: 1200px (`max-w-shell`) with a fluid gutter (`--z-layout-gutter`, 32 → 24 → 16px). Header, main and footer share it.
- **Reading measure**: 78ch (max-w-reading). The article is centered in it; the margins are air.
- **Index measure**: 68ch (max-w-measure). The archive and listening list use it.
- **Edge index**: fixed at the right edge, outside the measure. It never reserves a column and disappears below 1180px.
- **Breakpoints**: 600px (mobile), 900px (navigation/docs), 1180px (edge index), 1280px (nothing; the article does not need a wider shell).

Do not create a second page width inside a component.

## Shape

- `none` (0): buttons, tags, navigation, structural surfaces.
- `subtle` (3px): inputs, checkboxes, small controls.
- `sm` (6px): rare; only where a touch target needs it.
- No large radii and no pills.

## Elevation

Borders first. Shadows exist for floating layers only:

- `shadow-1`: tooltips and small popovers.
- `shadow-2`: menus and the demo controls.
- `shadow-3`: dialogs and sheets.

Content never has a shadow.

## Focus

2px accent outline with a 3px offset on every interactive element, in both themes. Focus is never removed; the offset may change for tight controls.

## Motion

| Token        | Value                            | Use                             |
| ------------ | -------------------------------- | ------------------------------- |
| `duration-1` | 120ms                            | Color, underline, border, icons |
| `duration-2` | 180ms                            | Menus, popovers, theme change   |
| `duration-3` | 260ms                            | Overlays and sheets             |
| `ease-out`   | `cubic-bezier(0.23, 1, 0.32, 1)` | Entrances and state changes     |

No bounce, no spring, no reveal-on-scroll, no animated width/height.

## Tailwind mapping

`packages/ui/src/styles/index.css` imports `tailwindcss` and maps the token values into `@theme inline`:

```css
@theme inline {
  --color-canvas: var(--z-color-canvas);
  --color-ink: var(--z-color-ink);
  --text-heading-40: var(--z-text-heading-40);
  --text-heading-40--line-height: var(--z-leading-heading-40);
  --text-heading-40--letter-spacing: var(--z-tracking-heading-40);
  --spacing-8: var(--z-space-8);
  --container-measure: var(--z-layout-measure);
  --ease-out: var(--z-motion-ease-out);
}
```

The utilities that are not token mappings:

- `shell` — max width, auto margins and the page gutter.
- `focus-ring` — the 2px / 3px focus treatment.
- `duration-1`, `duration-2`, `duration-3` — the motion tokens.
- `font-ui`, `font-reading`, `font-serif`, `font-code`, `font-prose` — the font families, resolved on the element. They are `@utility` rules rather than `@theme` variables, so `:lang(zh)` and the mono switch can re-resolve the stack instead of freezing it at the root.

Everything else is a normal Tailwind utility. The custom type sizes are registered with `tailwind-merge` in `packages/ui/src/recipes/merge-config.ts`, so `text-heading-40 text-ink` survives a merge instead of being read as two colors.
