# shuzhi.zone

Personal Astro site for writing, reading/listening lists, and small data-heavy tools.

## Stack

- Astro 5 static output
- Astro Content Collections for Markdown, MDX, and YAML content
- TypeScript strict mode
- Vitest for pure logic tests
- Bun lockfile for dependency management
- Cloudflare Workers static assets, with a small Worker for the root URL

## Commands

Use the local package manager/runtime configured for the project.

```sh
bun install
bun run dev
bun run build
bun run vitest
```

Markdown and MDX formatting uses Oxfmt managed by mise:

```sh
mise install
mise run fmt:check
mise run fmt
```

`fmt:check` checks formatting without modifying files. `fmt` writes formatting
changes to Markdown and MDX files only; neither task formats Astro components.

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
  styles/            Global tokens, reusable primitives, markdown styling
  worker/            Cloudflare Worker that picks a language for `/`
```

## Content Collections

- `blog`: one directory per post under `src/content/blog/<slug>/`; `index.md` (or `index.mdx`) holds the original with title, description, language, publish date, optional update date, and optional redirect, and its images sit beside it.
- `translations`: hand-made translations beside each original, `src/content/blog/<slug>/<locale>.md`, with their own title, description and `translatedAt`.
- `series`: series from `src/content/series.yaml`, with optional per-locale `translations` of the title and description.
- `book`: Bookshelf entries loaded from `src/content/book.yaml`; `/reading/books/` shows cover and title links to their source pages.
- `podcast`: Listening-list entries loaded from `src/content/podcast.yaml`.
- `dsibs`: Systemically important bank data loaded from `src/content/d-sibs.yaml`.

The D-SIBs page shows the latest published list first, followed by per-publication comparisons, a chronologically ordered bank history table, and changes between adjacent published lists. Each publication year links to its original announcement. Missing publication years are not interpolated.

## Languages

The site is built in eight languages, identified by BCP 47 tags: `en`, `es`, `de`, `ja`, `fr`, `pt`, `ru` and `zh-Hans`. Every page exists under the lowercase tag, such as `/ja/blog/refuge/` or `/zh-hans/reading/`. The page chrome follows that language; an article without a translation is shown in its original language with a notice, and its canonical URL points at the original. `/` redirects to the reader's saved or browser language through `src/worker/` (locally it redirects to `/en/`); every other URL is served as is. When a page also exists in a language the reader prefers, a one-line suggestion offers it. The language switcher in the footer and the suggestion save the choice in the `lang` cookie.

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
- `src/styles/global.css` owns tokens and layout primitives.
- `src/styles/components.css` owns reusable UI primitives.
- `src/styles/markdown.css` owns rendered article content styles.

## Design

The visual system is documented in [DESIGN.md](DESIGN.md). The site should stay content-first, low-noise, and optimized for long-form reading and dense data tables.
