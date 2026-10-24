---
name: douban-book-shelf
description: Add a Douban book (URL or subject id) to the zone books shelf at src/content/book.yaml, in a requested position, with its cover downloaded, scaled and verified. Use whenever the user drops a book.douban.com link and says to put it in the reading list, shelf, or "after X".
---

# Adding a book to the shelf from Douban

The shelf is `src/content/book.yaml` rendered at `/[locale]/reading/books/` as a cover grid.
Array order is display order: the loader stamps each entry with its index (`orderedFile` in
`src/content.config.ts`) and the page sorts by `data.order` (`sortByOrder`). So "put it third"
means "make it the third block in the YAML", and "after 系统思考" means "insert a block directly
after that one, keeping one blank line between entries".

## First, which list?

There are two reading surfaces. Do not mix them.

| Surface | File | Shape | Order |
| --- | --- | --- | --- |
| 书籍 / Books — `/reading/books/` | `src/content/book.yaml` | cover grid, `id` + `title` + `ogUrl` + `ogImage` | hand-ordered |
| 阅读 / Reading — `/reading/` | `src/content/reading-list.yaml` | text rows, `title` + `ogUrl` + `dateRead` | sorted by `dateRead` desc |

A Douban **book** link goes on the **books shelf**. The 阅读 page holds dated articles and a
paper PDF; it has no manual position, so a request for "third place" cannot be honoured there
without falsifying a `dateRead`. If the user's wording is genuinely ambiguous, the shelf is the
default; say which one you used in the reply.

## Workflow

1. **Read the anchor.** Confirm the exact title of the book the new one goes after (or the
   target index). Titles in this file are Chinese, some carry a `: <subtitle>` suffix.
2. **Fetch metadata and cover** with the bundled script (writes the cover, writes no YAML):

   ```powershell
   ./.agents/skills/douban-book-shelf/scripts/douban-book.ps1 37397789 -After "打造第二大脑" -DryRun
   ```

   It prints `TITLE / SUBTITLE / ISBN / COVER / SOURCE / CROP`, the ready-to-paste YAML block,
   and `INSERT after "<anchor>" -> position N of M`. Exit codes: `0` ok, `2` already on the
   shelf (do nothing, say so), `3` anchor not found (it lists the current shelf).

   Drop `-DryRun` to actually write the resized cover into `src/assets/books/`. Add `-Root` only
   when the workspace root is not the current directory.
3. **Look at the cover** with `read_image`. Confirm it is the right book and that the title block
   survives the 2:3 crop. If `CROP` printed a warning, say what will be clipped.
4. **Insert the block** with the `edit` tool, anchored on the neighbouring entry, not on line
   numbers, and keep the blank line between entries. Never renumber or rewrite existing blocks.
5. **Verify** (below), then report position and any judgement calls (title normalisation, crop).

## Entry rules

- `id` is the ISBN-13 as a string (`"9787521712599"`). It is the collection key, so it must be
  unique; a book already present is a duplicate even under a different URL. Only non-Douban
  sources (e.g. 微信读书) use an opaque id, matching their existing entry.
- `title` is the main title only. Drop edition markers such as `（第3版）` — the cover shows
  them, and the shelf does not carry editions.
- Two books can share a main title (`估值逻辑` ×2). Then append the page subtitle after `": "`,
  matching the existing `重构: 改善既有代码的设计`. Keep Douban's Chinese quotes (`读懂“十五五”`)
  as they are; inside a double-quoted YAML scalar they need no escaping.
- `ogUrl` is the canonical `https://book.douban.com/subject/<id>/`. Drop tracking query strings.
- `ogImage` is `"../assets/books/<douban image basename>.jpg"` — the basename of the Douban
  image (e.g. `s33638692.jpg`), never a re-invented name.

## Cover rules

- One file per book in `src/assets/books/`, named after the Douban image basename, JPEG.
- Width 270px, quality ~84, aspect preserved. That matches the 14 pre-existing covers; going
  wider costs bytes for no visible gain at the rendered size.
- Source: prefer `/l/public/` (usually 500–1080px), fall back to `/m/`. The script rewrites the
  `og:image` path to `/l/` automatically.
- Douban image requests need a browser `User-Agent` and a `Referer` of the subject page. The
  script sends both.
- The component frames covers at `aspect-[2/3]` with `object-cover`
  (`packages/ui/src/components/Book.astro`), so a portrait scan is cropped by a few percent and
  a square 3D scan loses ~33% of its width. Check with `read_image` before declaring done; if a
  square scan loses its title, prefer a different Douban edition with a portrait cover rather
  than padding the image.

## Verifying

```powershell
bun run build
$html = Get-Content -Raw 'dist/zh-hans/reading/books/index.html'
[regex]::Matches($html,'href="(https://(?:book\.douban\.com|weread\.qq\.com)[^"]*)"') | % { $_.Groups[1].Value }
[regex]::Matches($html,'class="[^"]*text-copy-14[^"]*"[^>]*>([^<]+)<') | % { $_.Groups[1].Value }
```

Compare both lists against the intended order; a build that passes but places the block wrong is
the failure mode this step exists for. `git status` should show `M src/content/book.yaml` plus
exactly one new untracked `.jpg` per added book — an orphan cover means an abandoned edit.

## Gotchas

- **Do not `web_fetch` a Douban subject page.** The full page is 10k+ tokens of reviews and
  recommendations for four fields. Parse with `Invoke-WebRequest` and the regexes below, which is
  what the script does; reach for `web_fetch` only when the script fails and you need to see why.
- Useful patterns, if you must go manual: title `<span property="v:itemreviewed">([^<]+)</span>`;
  subtitle `<span property="v:subtitle">([^<]+)</span>`; cover
  `<meta property="og:image" content="([^"]+)"`; ISBN `ISBN:\s*([0-9Xx-]+)` inside `<div id="info">`.
- Douban occludes `作者:`/`出版社:` differently across pages; do not try to build `title` from
  author data. `og:title` is the reliable field.
- `apps/design/src/data/demo.ts` carries a *hand-picked illustration* of the grid. It is not a
  mirror of the shelf and must not be synced when a real book is added.
- The YAML is parsed by `orderedFile`, which appends `order` — never add an `order` key yourself,
  and never sort the file.
- If the build fails on the new entry, the usual causes are an unescaped `"` in `title` and a
  missing cover file. `ogUrl` must be an absolute URL (`z.url()`).
