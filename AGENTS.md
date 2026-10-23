# Zone — repository guide

Bun workspace. The live Astro blog is at the root; the design system and its documentation are workspace packages.

- `packages/tokens/tokens.json` is the only source of design values. `tokens.css` is generated; `bun run tokens` and the token test keep them in sync.
- `packages/ui` owns the Tailwind theme, the prose layer and the Astro components. Components are `tv()` recipes; use `recipes/tv.ts` and `recipes/cn.ts` (they register the custom type scale for `tailwind-merge`).
- `apps/design` is Hairline's documentation and the four applied demos. It must consume `@zone/ui` and must not invent values or a second implementation.
- `design/` is the written design language: principles, foundations, components, patterns and decisions. Start at `design/README.md`.
- `src/` is the live blog. It consumes `@zone/ui` and Tailwind. The D-SIBs report and the stock-sell calculator both use the Hairline data language; there is no page-level compatibility stylesheet.

## Commands

```sh
bun run dev          # blog
bun run build        # blog
bun run test         # all tests, including token sync
bun run design       # Hairline docs + demos
bun run design:build # static design build
bun run tokens       # regenerate tokens.css
```

## Design system

- [design/README.md](./design/README.md)
- The live blog uses Hairline. The old alpha notes are retired; [design/README.md](./design/README.md) is the source of truth.
- When a visual rule changes, update the rule and its reason in `design/` in the same change. Add a decision record only for a cross-cutting choice or to supersede one (mark the old one `superseded`).
- The design is deliberately quiet: white paper, no sidebars, no labels where the layout already explains, and one accent. Check both themes, 390px and keyboard focus before calling a component done.
