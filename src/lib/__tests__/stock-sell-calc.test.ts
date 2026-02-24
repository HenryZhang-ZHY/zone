import { describe, it, expect } from 'vitest'
import { calcTargetCost, calcSellPriceForDilution, calcSellPoints } from '../stock-sell-calc'

// --- calcTargetCost ---

describe('calcTargetCost', () => {
  it('calculates correct target cost for basic case', () => {
    // dividend 0.5, yield 5% → 0.5 / 0.05 = 10
    expect(calcTargetCost(0.5, 0.05)).toBeCloseTo(10, 6)
  })

  it('calculates correct target cost for 10% yield', () => {
    // dividend 0.5, yield 10% → 0.5 / 0.10 = 5
    expect(calcTargetCost(0.5, 0.1)).toBeCloseTo(5, 6)
  })

  it('calculates correct target cost for 50% yield', () => {
    // dividend 1.0, yield 50% → 1.0 / 0.50 = 2
    expect(calcTargetCost(1.0, 0.5)).toBeCloseTo(2, 6)
  })

  it('returns 0 for zero dividend', () => {
    expect(calcTargetCost(0, 0.05)).toBe(0)
  })

  it('throws on zero yield rate', () => {
    expect(() => calcTargetCost(1.0, 0)).toThrow('Yield rate must be positive')
  })

  it('throws on negative yield rate', () => {
    expect(() => calcTargetCost(1.0, -0.05)).toThrow('Yield rate must be positive')
  })

  it('throws on negative dividend', () => {
    expect(() => calcTargetCost(-1.0, 0.05)).toThrow('Dividend per share must be non-negative')
  })
})

// --- calcSellPriceForDilution ---

describe('calcSellPriceForDilution', () => {
  it('calculates correct sell price – basic dilution scenario', () => {
    // N=1000, C=10, targetCost=6.25, M=500
    // P = (1000×10 - 500×6.25) / 500 = (10000 - 3125) / 500 = 13.75
    expect(calcSellPriceForDilution(10, 1000, 500, 6.25)).toBeCloseTo(13.75, 6)
  })

  it('calculates correct sell price for 1 lot', () => {
    // M=100: P = (10000 - 900×6.25) / 100 = 43.75
    expect(calcSellPriceForDilution(10, 1000, 100, 6.25)).toBeCloseTo(43.75, 6)
  })

  it('returns cost per share when targetCost equals costPerShare', () => {
    // P = (N×C - (N-M)×C) / M = C
    expect(calcSellPriceForDilution(10, 1000, 300, 10)).toBeCloseTo(10, 6)
  })

  it('throws on zero cost per share', () => {
    expect(() => calcSellPriceForDilution(0, 1000, 100, 6)).toThrow('Cost per share must be positive')
  })

  it('throws on negative cost per share', () => {
    expect(() => calcSellPriceForDilution(-5, 1000, 100, 6)).toThrow('Cost per share must be positive')
  })

  it('throws on zero sharesToSell', () => {
    expect(() => calcSellPriceForDilution(10, 1000, 0, 6)).toThrow(
      'Shares to sell must be between 0 and total shares (exclusive)',
    )
  })

  it('throws when sharesToSell equals shares', () => {
    expect(() => calcSellPriceForDilution(10, 1000, 1000, 6)).toThrow(
      'Shares to sell must be between 0 and total shares (exclusive)',
    )
  })

  it('throws when sharesToSell exceeds shares', () => {
    expect(() => calcSellPriceForDilution(10, 1000, 1100, 6)).toThrow(
      'Shares to sell must be between 0 and total shares (exclusive)',
    )
  })

  it('throws on negative target cost', () => {
    expect(() => calcSellPriceForDilution(10, 1000, 100, -1)).toThrow('Target cost must be non-negative')
  })

  it('handles zero target cost', () => {
    // P = N×C / M = 10000 / 500 = 20
    expect(calcSellPriceForDilution(10, 1000, 500, 0)).toBeCloseTo(20, 6)
  })
})

// --- calcSellPoints ---

describe('calcSellPoints', () => {
  // C=10, N=1000, dividend=0.5 (natural yield 5%)
  // Profitable only when target yield > natural yield (6%+)
  const basicInput = {
    costPerShare: 10,
    shares: 1000,
    dividendPerShare: 0.5,
  }

  it('only returns profitable entries (sellPrice > costPerShare)', () => {
    const result = calcSellPoints(basicInput)
    result.forEach((r) => {
      expect(r.sellPrice).toBeGreaterThan(basicInput.costPerShare)
      expect(r.profitPercent).toBeGreaterThan(0)
    })
  })

  it('sharesToSell is always a multiple of 100', () => {
    const result = calcSellPoints(basicInput)
    result.forEach((r) => {
      expect(r.sharesToSell % 100).toBe(0)
    })
  })

  it('sharesToSell ranges from 100 to shares-100', () => {
    const result = calcSellPoints(basicInput)
    result.forEach((r) => {
      expect(r.sharesToSell).toBeGreaterThanOrEqual(100)
      expect(r.sharesToSell).toBeLessThanOrEqual(basicInput.shares - 100)
    })
  })

  it('yieldPercent ranges from 4 to 100', () => {
    const result = calcSellPoints(basicInput)
    result.forEach((r) => {
      expect(r.yieldPercent).toBeGreaterThanOrEqual(4)
      expect(r.yieldPercent).toBeLessThanOrEqual(100)
    })
  })

  it('remainingShares equals shares minus sharesToSell', () => {
    const result = calcSellPoints(basicInput)
    result.forEach((r) => {
      expect(r.remainingShares).toBe(basicInput.shares - r.sharesToSell)
    })
  })

  it('dilutedCost equals dividend / yieldRate', () => {
    const result = calcSellPoints(basicInput)
    result.forEach((r) => {
      const expected = Math.round((basicInput.dividendPerShare / (r.yieldPercent / 100)) * 100) / 100
      expect(r.dilutedCost).toBe(expected)
    })
  })

  it('verifies a specific sell price calculation', () => {
    // 8% yield: targetCost=6.25, M=500: P=(10000-500×6.25)/500=13.75
    const result = calcSellPoints(basicInput)
    const entry = result.find((r) => r.yieldPercent === 8 && r.sharesToSell === 500)!
    expect(entry).toBeDefined()
    expect(entry.sellPrice).toBeCloseTo(13.75, 2)
    expect(entry.dilutedCost).toBe(6.25)
    expect(entry.remainingShares).toBe(500)
  })

  it('returns empty array when shares < 200', () => {
    expect(calcSellPoints({ costPerShare: 10, shares: 100, dividendPerShare: 0.5 })).toHaveLength(0)
    expect(calcSellPoints({ costPerShare: 10, shares: 150, dividendPerShare: 0.5 })).toHaveLength(0)
  })

  it('returns results when dividend is 0 (targetCost=0, sell price = N×C/M)', () => {
    // targetCost=0 → P = N×C/M, always > C, so all lots are profitable
    const result = calcSellPoints({ costPerShare: 10, shares: 1000, dividendPerShare: 0 })
    expect(result.length).toBeGreaterThan(0)
    result.forEach((r) => {
      expect(r.sellPrice).toBeGreaterThan(10)
      expect(r.dilutedCost).toBe(0)
    })
  })

  it('profitPercent rounds to 2 decimal places', () => {
    const result = calcSellPoints(basicInput)
    result.forEach((r) => {
      const decimals = r.profitPercent.toString().split('.')[1]
      expect(!decimals || decimals.length <= 2).toBe(true)
    })
  })

  it('throws on zero cost per share', () => {
    expect(() => calcSellPoints({ costPerShare: 0, shares: 1000, dividendPerShare: 0.5 })).toThrow('Cost per share must be positive')
  })

  it('throws on negative cost per share', () => {
    expect(() => calcSellPoints({ costPerShare: -10, shares: 1000, dividendPerShare: 0.5 })).toThrow('Cost per share must be positive')
  })

  it('throws on zero shares', () => {
    expect(() => calcSellPoints({ costPerShare: 10, shares: 0, dividendPerShare: 0.5 })).toThrow('Shares must be positive')
  })

  it('throws on negative shares', () => {
    expect(() => calcSellPoints({ costPerShare: 10, shares: -1000, dividendPerShare: 0.5 })).toThrow('Shares must be positive')
  })

  it('throws on negative dividend', () => {
    expect(() => calcSellPoints({ costPerShare: 10, shares: 1000, dividendPerShare: -0.5 })).toThrow('Dividend per share must be non-negative')
  })

  it('works with shares not a multiple of 100', () => {
    const result = calcSellPoints({ costPerShare: 10, shares: 1500, dividendPerShare: 1.0 })
    result.forEach((r) => {
      expect(r.sharesToSell % 100).toBe(0)
      expect(r.remainingShares).toBeGreaterThanOrEqual(100)
      expect(r.sellPrice).toBeGreaterThan(10)
    })
  })
})
