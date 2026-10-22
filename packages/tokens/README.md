# @zone/tokens

The single source of truth for Hairline's values.

- `tokens.json` — colors (light + dark), font families, type scale, spacing, radii, shadows, motion and layout.
- `build.mjs` — generates `tokens.css` from the JSON. No dependencies.
- `tokens.css` — checked in, consumed by `@zone/ui` and the documentation app.
- `tokens.test.ts` — fails when `tokens.css` and `tokens.json` disagree.

## Commands

```sh
bun run tokens                    # from the repo root
bun --filter @zone/tokens build   # from anywhere in the workspace
```

## Adding a token

1. Add the light and dark values under `color.light` and `color.dark`, or add the value to the relevant group.
2. Run `bun run tokens`.
3. Map it in `packages/ui/src/styles/index.css` under `@theme inline` if it should become a Tailwind utility.
4. Run `bun run test`.

Colors are declared as `light-dark(light, dark)` in the generated CSS. The document's `color-scheme` decides which value is live. That means a token name is stable across themes.

Type tokens generate CSS variables (`--z-text-heading-40`, `--z-leading-heading-40`, `--z-tracking-heading-40`, `--z-weight-heading-40`). Tailwind turns them into `text-heading-40` with the line-height and tracking attached.

Layout tokens: `shell`, `measure`, `gutter`, `page-top`, `page-bottom`. There is deliberately no `rail` token.
