# shuzhi.zone

Personal Astro site for writing, reading/listening lists, and small data-heavy tools.

## Stack

- Astro 5 static output
- Astro Content Collections for Markdown, MDX, and YAML content
- TypeScript strict mode
- Vitest for pure logic tests
- Bun lockfile for dependency management
- Cloudflare/Wrangler deployment config

## Commands

Use the local package manager/runtime configured for the project.

```sh
bun install
bun run dev
bun run build
bun run test
```

## Project Structure

```text
src/
  components/        Astro components and feature-specific UI
  content/           Blog posts and YAML-backed content collections
  layouts/           Page shells and article layouts
  lib/               Pure TypeScript domain logic with tests
  pages/             Route-level page composition
  scripts/           Browser-only behavior for interactive components
  styles/            Global tokens, reusable primitives, markdown styling
```

## Content Collections

- `blog`: Markdown/MDX posts with title, description, publish date, optional update date, and optional redirect.
- `book`: Reading-list entries loaded from `src/content/book.yaml`.
- `podcast`: Listening-list entries loaded from `src/content/podcast.yaml`.
- `dsibs`: Systemically important bank data loaded from `src/content/d-sibs.yaml`.

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
