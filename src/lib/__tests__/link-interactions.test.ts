import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

function readSource(...segments: string[]) {
  return readFileSync(resolve(root, 'src', ...segments), 'utf8')
}

function ruleBody(source: string, selector: RegExp) {
  const match = source.match(selector)
  expect(match, `Missing rule matching ${selector}`).not.toBeNull()
  return match![1]
}

describe('link interaction taxonomy', () => {
  it('keeps the brand link restrained on hover', () => {
    const source = readSource('components', 'SiteIdentity.astro')
    const hoverRule = ruleBody(source, /\.site-identity-link:hover\s*\{([\s\S]*?)\n\s*\}/)

    expect(hoverRule).toContain('color: var(--z-color-text-accent)')
    expect(hoverRule).not.toContain('text-decoration')
  })

  it('makes post titles explicit content entry links on hover and focus', () => {
    const source = readSource('pages', 'index.astro')
    const titleRule = ruleBody(source, /\.post-title\s*\{([\s\S]*?)\n\s*\}/)
    const interactiveRule = ruleBody(
      source,
      /\.post-link:hover \.post-title,\s*\n\s*\.post-link:focus-visible \.post-title,\s*\n\s*\.post-link:active \.post-title\s*\{([\s\S]*?)\n\s*\}/,
    )

    expect(titleRule).toContain('text-decoration-color: transparent')
    expect(interactiveRule).toContain('color: var(--z-color-text-accent)')
    expect(interactiveRule).toContain('text-decoration-color: currentColor')
  })

  it('uses position-oriented affordances for table-of-contents links', () => {
    const source = readSource('layouts', 'BlogPost.astro')
    const hoverRule = ruleBody(
      source,
      /\.toc-link:hover,\s*\n\s*\.toc-link:focus-visible\s*\{([\s\S]*?)\n\s*\}/,
    )
    const activeRule = ruleBody(source, /\.toc-link:global\(\.active\)\s*\{([\s\S]*?)\n\s*\}/)

    expect(hoverRule).toContain('border-inline-start-color')
    expect(hoverRule).toContain('background-color: var(--z-color-row-hover)')
    expect(activeRule).toContain('border-inline-start-color: var(--z-color-text-accent)')
    expect(activeRule).toContain('background-color: var(--z-color-row-hover)')
  })
})
