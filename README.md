# shuzhi.zone

Personal Astro site for writing, reading/listening lists, and small data-heavy tools — plus **Hairline**, the site's design system, and its documentation/demo app.

## Stack

- Astro 7 static output
- Bun workspaces for the monorepo
- Tailwind CSS v4 + `tailwind-variants` for the design system
- Astro Content Collections for Markdown, MDX and YAML content
- TypeScript strict mode
- Vitest for pure logic and token-sync tests
- Cloudflare Workers static assets, with a small Worker for the root URL

## Monorepo

```text
apps/
  design/            Hairline: documentation, foundations, components, demos
packages/
  tokens/            tokens.json -> tokens.css (the only source of values)
  ui/                Tailwind theme, prose layer, Astro components
src/                 The live blog (Hairline, @zone/ui)
design/              The written design language: principles, foundations, patterns, decisions
```

The blog stays at the workspace root while the design system is introduced. Its pages migrate one at a time to `@zone/ui`; until a page is migrated it keeps the styles in `src/styles/`. Do not mix the two systems inside one page.

## Commands

```sh
bun install

bun run dev            # the live blog
bun run build          # build the live blog
bun run test           # all tests, including tokens.css sync

bun run design         # Hairline docs + demos
bun run design:build   # static build of the design app
bun run tokens         # regenerate packages/tokens/tokens.css
```

Markdown and MDX formatting uses Oxfmt managed by mise:

```sh
mise install
mise run fmt:check
mise run fmt
```

`fmt:check` checks formatting without modifying files. `fmt` writes formatting changes to Markdown and MDX files only; neither task formats Astro components.

## Design system

- Start at [design/README.md](design/README.md).
- The system lives in `packages/tokens` and `packages/ui`; the documentation and the four applied demos live in `apps/design`.
- The live blog in `src/` consumes `@zone/ui` and the Hairline tokens. The stock-sell calculator keeps a scoped compatibility stylesheet (`src/styles/tools.css`) for its form and result table; the D-SIBs report uses the UI package's `GroupMark` and `CompositionBar`.

## Project Structure

```text
src/
  components/        Astro components and feature-specific UI
  content/           Blog posts and YAML-backed content collections
  i18n/              Locale registry, URL helpers, language negotiation, per-locale messages
  integrations/      Build hooks: sitemap.xml and legacy redirects from the built pages
  layouts/           Page shells and article layouts
  lib/               Pure TypeScript domain logic with tests
  pages/             Route-level page composition
  scripts/           Browser-only behavior for interactive components
  styles/            The live blog's current tokens, primitives and markdown styling
  worker/            Cloudflare Worker that picks a language for `/`
```

## Content Collections

- `blog`: one directory per post under `src/content/blog/<slug>/`; `index.md` (or `index.mdx`) holds the original with title, description, language, publish date, optional update date, and optional redirect, and its images sit beside it.
- `translations`: hand-made translations beside each original, `src/content/blog/<slug>/<locale>.md`, with their own title, description and `translatedAt`.
- `series`: series from `src/content/series.yaml`, with optional per-locale `translations` of the title and description.
- `book`: Bookshelf entries loaded from `src/content/book.yaml`; `/reading/books/` shows cover and title links to their source pages.
- `podcast`: Listening-list entries loaded from `src/content/podcast.yaml`.
- `dsibs`: Systemically important bank data loaded from `src/content/d-sibs.yaml`.

The D-SIBs report opens with the latest finding and a composition bar, then shared-baseline release bars, a bank matrix with group marks and sparkline popovers, a hairline change timeline, and the complete lists by release. Each publication year links to its original announcement. Missing publication years are not interpolated.

## Languages

The site is built in eight languages, identified by BCP 47 tags: `en`, `es`, `de`, `ja`, `fr`, `pt`, `ru` and `zh-Hans`. Every page exists under the lowercase tag, such as `/ja/blog/refuge/` or `/zh-hans/reading/`. The page chrome follows that language; an article without a translation is shown in its original language with a notice, and its canonical URL points at the original. `/` redirects to the reader's saved or browser language through `src/worker/` (locally it redirects to `/en/`); every other URL is served as is. When a page also exists in a language the reader prefers, a one-line suggestion offers it. The header language menu, the footer index and the suggestion save the choice in the `lang` cookie.

To translate a post, add a file named after the language next to the original:

```text
src/content/blog/refuge/
  index.md   original (lang: zh-Hans)
  en.md      translation
```

```markdown
---
title: "refuge: OneDrive as the storage layer for private Git repositories"
description: "Why I built refuge: back up, restore and use private Git repositories across devices with OneDrive as storage."
translatedAt: 2026-10-17
---

Translated body. Images use the same relative paths as the original.
```

Publish date, update date and series come from the original. When the original's `updatedDate` is later than `translatedAt`, the build warns and the page says the translation may be out of date. To translate a series, add `translations: { en: { title, description } }` to its entry in `series.yaml`. Interface strings live in `src/i18n/messages/<locale>.ts`; English is the reference set and every locale must define the same keys.

## Architecture Conventions

- Pages compose data, layouts, and components; avoid putting domain transformation or browser behavior directly in pages.
- `src/lib` owns pure logic and should have focused Vitest coverage.
- `src/components` owns markup and scoped component styles.
- `src/scripts` owns browser behavior and should use idempotent initializers when a page can be re-entered.
- `src/styles/global.css` owns the live blog's tokens and layout primitives.
- `src/styles/components.css` owns the live blog's reusable UI primitives.
- `src/styles/markdown.css` owns rendered article content styles.
- New design-system work belongs in `packages/ui` and `apps/design`, not in `src/styles`.
