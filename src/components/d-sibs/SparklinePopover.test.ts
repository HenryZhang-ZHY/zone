import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./SparklinePopover.astro', import.meta.url), 'utf8')

function cssRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`))

  expect(match, `Missing CSS rule for ${selector}`).not.toBeNull()
  return match![1]
}

describe('SparklinePopover current-state emphasis', () => {
  it('uses neutral emphasis instead of accent blue', () => {
    const currentTrack = cssRule('.pop-track-item.is-current')
    const currentDot = cssRule('.pop-chart :global(.pop-dot.is-current)')

    expect(currentTrack).not.toContain('--z-color-accent')
    expect(currentDot).not.toContain('--z-color-accent')
  })
})
