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

  it('keeps frequent previews instant and offers a non-spatial reduced-motion state', () => {
    const preview = cssRule('.spark-popover[data-instant]')

    expect(preview).toContain('transition: none')
    expect(source).toContain(".spark-popover[data-mode='preview']")
    expect(source).toContain("event.pointerType !== 'mouse'")
    expect(source).toContain("event.detail === 0")
    expect(source).toContain('@media (prefers-reduced-motion: reduce)')
    expect(source).toContain(".spark-popover[data-placement='below'][aria-hidden='true']")
    expect(source).toContain('transform: none')
  })
})
