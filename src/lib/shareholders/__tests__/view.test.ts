import { describe, expect, it } from 'vitest'
import { formatCount, formatDelta, formatPercent, formatShares } from '../view'

describe('formatting', () => {
  it('uses one decimal and never prints a negative zero', () => {
    expect(formatPercent(21.7399)).toBe('21.7%')
    expect(formatPercent(-0.0001)).toBe('0.0%')
    expect(formatPercent(-0.04, 1)).toBe('0.0%')
    expect(formatPercent(-0.01, 2)).toBe('−0.01%')
    expect(formatPercent(99.999)).toBe('100.0%')
  })

  it('signs deltas with a true minus', () => {
    expect(formatDelta(3.25)).toBe('+3.3')
    expect(formatDelta(-2.15)).toBe('−2.2')
    expect(formatDelta(0)).toBe('0.0')
  })

  it('writes share counts in the unit a reader can hold', () => {
    expect(formatShares(493_251_011)).toBe('4.93 万亿股')
    expect(formatShares(25_096_234.81)).toBe('2,509.6 亿股')
    expect(formatShares(125_619.78)).toBe('12.56 亿股')
    expect(formatCount(24584)).toBe('24,584')
  })
})
