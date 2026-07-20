import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./ChangesTimeline.astro', import.meta.url), 'utf8')

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`))

  expect(match, `Missing CSS rule for ${selector}`).not.toBeNull()
  return match![1]
}

describe('ChangesTimeline year cards', () => {
  it('uses neutral card hierarchy instead of accent decoration', () => {
    const total = cssRule('.change-total')

    expect(source).not.toContain('.change-year.has-changes::before')
    expect(total).not.toContain('--z-color-accent')
    expect(total).toContain('--z-color-border-subtle')
    expect(total).toContain('--z-color-text-secondary')
  })
})
