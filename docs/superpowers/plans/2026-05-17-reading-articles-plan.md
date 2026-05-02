# Reading Page: Add Articles, Posts & Papers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Reading page with tab-based navigation between a date-sorted reading list (articles/posts/papers) and the existing book cover grid.

**Architecture:** Two separate Astro content collections (`book` unchanged, `readingList` new), loaded from two YAML files. The reading.astro page uses CSS-only radio-button tabs to toggle between a list view and the cover grid, no JavaScript.

**Tech Stack:** Astro 5.x, YAML content loader, CSS-only tabs

---

### Task 1: Create reading-list.yaml with sample data

**Files:**
- Create: `src/content/reading-list.yaml`

- [ ] **Step 1: Write the YAML file**

```yaml
- type: article
  title: "How to Build Better Habits"
  ogUrl: "https://jamesclear.com/habits"
  dateRead: 2025-01-10

- type: paper
  title: "Attention Is All You Need"
  ogUrl: "https://arxiv.org/abs/1706.03762"
  dateRead: 2024-11-03

- type: post
  title: "The Day You Became a Better Writer"
  ogUrl: "https://dilbertblog.typepad.com/the_dilbert_blog/2007/06/the_day_you_bec.html"
  dateRead: 2024-09-15
```

- [ ] **Step 2: Commit**

```bash
git add src/content/reading-list.yaml
git commit -m "feat: add reading-list.yaml with sample entries
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Add readingList collection to content config

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Add the readingList collection definition**

In `src/content.config.ts`, add after the `book` collection definition:

```typescript
const readingList = defineCollection({
	loader: file('./src/content/reading-list.yaml'),
	schema: z.object({
		type: z.enum(['article', 'post', 'paper']),
		title: z.string(),
		ogUrl: z.string().url(),
		dateRead: z.coerce.date(),
	}),
});
```

- [ ] **Step 2: Register it in the exported collections**

Change:
```typescript
export const collections = { blog, book, podcast, dsibs };
```
To:
```typescript
export const collections = { blog, book, podcast, dsibs, readingList };
```

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "feat: add readingList content collection
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Rewrite reading.astro with tab navigation

**Files:**
- Modify: `src/pages/reading.astro`

- [ ] **Step 1: Replace the entire file with the new implementation**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import { Image } from 'astro:assets'
import { SITE_TITLE } from '../consts'
import { getCollection } from 'astro:content'

const books = await getCollection('book')
const readingItems = await getCollection('readingList')

const sortedReadingItems = readingItems.sort(
  (a, b) => b.data.dateRead.getTime() - a.data.dateRead.getTime()
)
---

<BaseLayout title={`Reading | ${SITE_TITLE}`}>
  <main class="z-main z-main--narrow reading-page">
    <div class="tabs">
      <input type="radio" id="tab-reading-list" name="reading-tab" checked />
      <label for="tab-reading-list">Reading List</label>
      <input type="radio" id="tab-books" name="reading-tab" />
      <label for="tab-books">Books</label>
      <hr class="tab-divider" />

      <section class="tab-panel" id="panel-reading-list">
        <div class="z-stack-list">
          {sortedReadingItems.map((item) => (
            <article class="reading-item z-stack-item--roomy">
              <div class="reading-item-main">
                <h2 class="reading-item-title">
                  <a href={item.data.ogUrl} target="_blank" rel="noopener noreferrer">
                    {item.data.title}
                  </a>
                </h2>
                <div class="reading-item-meta">
                  <span class="z-tag reading-type-tag" data-type={item.data.type}>
                    {item.data.type}
                  </span>
                  <time class="reading-date" datetime={item.data.dateRead.toISOString().slice(0, 10)}>
                    {item.data.dateRead.toISOString().slice(0, 10)}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section class="tab-panel" id="panel-books">
        <div class="books-container">
          {books.map((book, index) => (
            <article class="book-item">
              <a href={book.data.ogUrl} class="book-link" title={book.data.title} target="_blank" rel="noopener noreferrer">
                <div class="book-cover">
                  <Image src={book.data.ogImage} alt={`Cover of ${book.data.title}`} loading={index < 12 ? 'eager' : 'lazy'} width={140} height={210} />
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  </main>
</BaseLayout>

<style>
  .reading-page {
    padding-top: var(--z-space-10);
  }

  /* Tabs */
  .tabs input[type="radio"] {
    display: none;
  }

  .tabs label {
    display: inline-block;
    font-size: var(--z-text-lg);
    font-weight: 600;
    padding: 0.5rem 1.25rem;
    cursor: pointer;
    color: var(--z-color-text-secondary);
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
  }

  .tabs label:hover {
    color: var(--z-color-text);
  }

  .tabs input[type="radio"]:checked + label {
    color: var(--z-color-text-accent);
    border-bottom-color: var(--z-color-text-accent);
  }

  /* Tab panels */
  .tab-panel {
    display: none;
    padding-top: var(--z-space-8);
  }

  #tab-reading-list:checked ~ #panel-reading-list {
    display: block;
  }

  #tab-books:checked ~ #panel-books {
    display: block;
  }

  /* Tab divider line */
  .tab-divider {
    border: none;
    border-top: 1px solid var(--z-color-hairline-light);
    margin: 0 0 var(--z-space-8) 0;
  }

  /* Reading list items */
  .reading-item {
    display: flex;
    align-items: baseline;
  }

  .reading-item-main {
    flex: 1;
    min-width: 0;
  }

  .reading-item-title {
    font-size: var(--z-text-h4);
    font-weight: 700;
    line-height: 1.3;
    margin: 0 0 0.5rem 0;
  }

  .reading-item-title a {
    color: inherit;
    text-decoration: none;
  }

  .reading-item-title a:hover {
    color: var(--z-color-text-accent);
  }

  .reading-item-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: var(--z-text-sm);
  }

  .reading-type-tag {
    font-size: var(--z-text-2xs);
    font-weight: 600;
    line-height: 1.5;
    padding: 0.125rem 0.4rem;
    border-radius: var(--z-radius-sm);
    text-transform: capitalize;
  }

  .reading-type-tag[data-type="article"] {
    background: var(--z-data-state-bg);
    color: var(--z-data-state);
  }

  .reading-type-tag[data-type="paper"] {
    background: var(--z-data-g3-bg);
    color: var(--z-data-g3);
  }

  .reading-type-tag[data-type="post"] {
    background: var(--z-data-g2-bg);
    color: var(--z-data-g2);
  }

  .reading-date {
    color: var(--z-color-text-dimmed);
  }

  /* Books grid (unchanged from original) */
  .books-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3rem 2rem;
  }

  .book-item {
    display: flex;
    flex-direction: column;
  }

  .book-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .book-cover {
    width: 100%;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    background: var(--z-color-surface-muted);
    border: 1px solid var(--z-color-hairline-light);
  }

  .book-cover img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    background: var(--z-color-surface-muted);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .tabs label {
      font-size: var(--z-text-base);
      padding: 0.5rem 1rem;
    }

    .reading-item-title {
      font-size: var(--z-text-lg);
    }

    .books-container {
      grid-template-columns: repeat(3, 1fr);
      gap: 2.5rem 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .tabs label {
      font-size: var(--z-text-sm);
      padding: 0.4rem 0.75rem;
    }

    .reading-item-title {
      font-size: var(--z-text-base);
    }

    .reading-item-meta {
      flex-direction: row;
      gap: 0.5rem;
    }

    .books-container {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem 1.25rem;
    }
  }

  @media (min-width: 1024px) {
    .books-container {
      grid-template-columns: repeat(5, 1fr);
      gap: 4rem 3rem;
    }
  }

  @media (min-width: 1280px) {
    .books-container {
      grid-template-columns: repeat(6, 1fr);
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/reading.astro
git commit -m "feat: add tab navigation and reading list to reading page
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Verify build

**Files:** (none)

- [ ] **Step 1: Run dev server and check for errors**

```bash
npx astro build --silent 2>&1
```
Expected: Build completes without errors.

- [ ] **Step 2: Check generated page exists**

```bash
ls dist/reading/index.html 2>/dev/null && echo "Page generated" || echo "Missing"
```
Expected: `Page generated`

- [ ] **Step 3: Spot-check the generated HTML contains both tabs**

```bash
grep -c 'tab-reading-list' dist/reading/index.html && grep -c 'tab-books' dist/reading/index.html && grep -c 'panel-reading-list' dist/reading/index.html && grep -c 'panel-books' dist/reading/index.html
```
Expected: Each grep returns a count >= 1.
