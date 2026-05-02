# Reading Page: Add Articles, Posts & Papers

## Summary

Expand the Reading page to support articles, posts, and papers in addition to books. Two separate content collections with tab-based navigation.

## Data Model

### `book.yaml` (unchanged)
Books only, ordered by importance. Fields: `id`, `title`, `ogUrl`, `ogImage`.

### `reading-list.yaml` (new)
Articles, posts, and papers, ordered by date read. Fields:
- `type`: `article` | `post` | `paper`
- `title`: string
- `ogUrl`: URL string
- `dateRead`: date

No overlap between the two files — a reading item appears in exactly one collection.

## Content Config

Add `readingList` collection in `content.config.ts`, loaded from `reading-list.yaml`.

## Page Structure

`reading.astro` — two tabs via CSS-only radio buttons:

- **Tab "Reading List"** (default): sorted by `dateRead` descending. Each item shows title (linked), type badge, date.
- **Tab "Books"**: existing cover grid, sorted by YAML file order.

## Visual

```
 [Reading List]  [Books]
────────────────────────────
How to Build Better Habits   [article] 2025-01-10
Attention Is All You Need    [paper]   2024-11-03
The Day You Became a Better Writer [post] 2024-09-15
```

Tab state toggles visibility of two content panels with no JavaScript.
