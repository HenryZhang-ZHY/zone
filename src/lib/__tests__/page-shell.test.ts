import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const readSource = (...segments: string[]) => readFileSync(resolve(root, 'src', ...segments), 'utf8')

describe('page-to-page layout', () => {
  it('centers both editorial lists and articles without letting the TOC shift them', () => {
    const css = readSource('styles', 'global.css')
    expect(css).toMatch(/body\s*\{[^}]*--z-page-max-width:\s*1100px/s)
    expect(css).not.toMatch(/\.z-page-shell--article\s*\{[^}]*--z-page-max-width:/s)
    expect(css).not.toMatch(/\.z-page-shell--medium\s*\{[^}]*--z-page-pad-x:/s)
    expect(css).toMatch(/\.z-editorial-column\s*\{[^}]*max-width:\s*var\(--z-article-reading-width\);[^}]*margin-inline:\s*auto/s)
    const identity = readSource('components', 'SiteIdentity.astro')
    expect(identity).toContain('site-identity-inner')
    expect(identity).toMatch(/\.z-page-shell--editorial\) \.site-identity-inner\s*\{[^}]*max-width:\s*var\(--z-article-reading-width\);[^}]*margin-inline:\s*auto/s)

    for (const page of ['index.astro', 'reading.astro', 'listening.astro']) {
      expect(readSource('pages', page)).toContain('z-editorial-column')
      expect(readSource('pages', page)).toMatch(/<BaseLayout[^\n]*\beditorial\b/)
    }
    const article = readSource('layouts', 'BlogPost.astro')
    expect(article).toContain('editorial')
    expect(article).toMatch(/main\s*\{[^}]*max-width:\s*var\(--z-article-reading-width\);[^}]*margin-inline:\s*auto/s)
    expect(article).toContain('inset-inline-start: calc(50% + var(--z-article-reading-width) / 2 + var(--z-space-8))')
    expect(article).not.toContain('grid-template-columns:')
  })

  it('uses a small reversible page cross-fade and removes it for reduced motion', () => {
    const css = readSource('styles', 'global.css')
    expect(css).toContain('@view-transition')
    expect(css).toContain('navigation: auto')
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/)
    expect(css).toContain('::view-transition-old(root)')
    expect(css).toContain('::view-transition-new(root)')
  })
})
