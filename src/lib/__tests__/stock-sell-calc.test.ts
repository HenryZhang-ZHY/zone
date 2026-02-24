import { describe, it, expect } from 'vitest'
import { calcSellPrice, calcProfitPercent, calcSellPoints } from '../stock-sell-calc'

// --- calcSellPrice ---

describe('calcSellPrice', () => {
  it('calculates correct sell price for a basic case', () => {
    // dividend 0.5, yield 5% → 0.5 / 0.05 = 10
    expect(calcSellPrice(0.5, 0.05)).toBeCloseTo(10, 6)
  })

  it('calculates correct sell price for 3% yield', () => {
    // dividend 0.3, yield 3% → 0.3 / 0.03 = 10
    expect(calcSellPrice(0.3, 0.03)).toBeCloseTo(10, 6)
  })

  it('calculates correct sell price for 10% yield', () => {
    // dividend 1.0, yield 10% → 1.0 / 0.10 = 10
    expect(calcSellPrice(1.0, 0.1)).toBeCloseTo(10, 6)
  })

  it('handles very small dividends', () => {
    expect(calcSellPrice(0.01, 0.05)).toBeCloseTo(0.2, 6)
  })

  it('handles very large dividends', () => {
    expect(calcSellPrice(100, 0.05)).toBeCloseTo(2000, 6)
  })

  it('returns 0 for zero dividend', () => {
    expect(calcSellPrice(0, 0.05)).toBe(0)
  })

  it('throws on zero yield rate', () => {
    expect(() => calcSellPrice(1.0, 0)).toThrow('Yield rate must be positive')
  })

  it('throws on negative yield rate', () => {
    expect(() => calcSellPrice(1.0, -0.05)).toThrow('Yield rate must be positive')
  })

  it('throws on negative dividend', () => {
    expect(() => calcSellPrice(-1.0, 0.05)).toThrow('Dividend per share must be non-negative')
  })
})

// --- calcProfitPercent ---

describe('calcProfitPercent', () => {
  it('returns positive profit when sell > cost', () => {
    // sell 15, cost 10 → (15-10)/10 × 100 = 50%
    expect(calcProfitPercent(15, 10)).toBeCloseTo(50, 6)
  })

  it('returns zero when sell == cost', () => {
    expect(calcProfitPercent(10, 10)).toBe(0)
  })

  it('returns negative profit when sell < cost', () => {
    // sell 8, cost 10 → (8-10)/10 × 100 = -20%
    expect(calcProfitPercent(8, 10)).toBeCloseTo(-20, 6)
  })

  it('handles large profit', () => {
    expect(calcProfitPercent(100, 10)).toBeCloseTo(900, 6)
  })

  it('throws on zero cost', () => {
    expect(() => calcProfitPercent(15, 0)).toThrow('Cost per share must be positive')
  })

  it('throws on negative cost', () => {
    expect(() => calcProfitPercent(15, -5)).toThrow('Cost per share must be positive')
  })
})

// --- calcSellPoints ---

describe('calcSellPoints', () => {
  const basicInput = {
    costPerShare: 10,
    shares: 1000,
    dividendPerShare: 0.5,
  }

  it('returns 8 entries (3% to 10%)', () => {
    const result = calcSellPoints(basicInput)
    expect(result).toHaveLength(8)
  })

  it('yield percentages are 3 through 10', () => {
    const result = calcSellPoints(basicInput)
    expect(result.map((r) => r.yieldPercent)).toEqual([3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('sell prices are sorted descending (lower yield = higher price)', () => {
    const result = calcSellPoints(basicInput)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].sellPrice).toBeLessThanOrEqual(result[i - 1].sellPrice)
    }
  })

  it('calculates correct sell price for 3% yield', () => {
    const result = calcSellPoints(basicInput)
    // 0.5 / 0.03 = 16.6667 → rounded to 16.67
    expect(result[0].sellPrice).toBe(16.67)
  })

  it('calculates correct sell price for 5% yield', () => {
    const result = calcSellPoints(basicInput)
    // 0.5 / 0.05 = 10
    const entry = result.find((r) => r.yieldPercent === 5)!
    expect(entry.sellPrice).toBe(10)
  })

  it('calculates correct sell price for 10% yield', () => {
    const result = calcSellPoints(basicInput)
    // 0.5 / 0.10 = 5
    expect(result[7].sellPrice).toBe(5)
  })

  it('calculates correct sell total', () => {
    const result = calcSellPoints(basicInput)
    // 5% yield: price 10, total = 10 × 1000 = 10000
    const entry = result.find((r) => r.yieldPercent === 5)!
    expect(entry.sellTotal).toBe(10000)
  })

  it('calculates correct profit percent (positive)', () => {
    const result = calcSellPoints(basicInput)
    // 3% yield: price 16.67, profit = (16.67-10)/10 × 100 = 66.7%
    expect(result[0].profitPercent).toBe(66.67)
  })

  it('calculates correct profit percent (break even at 5%)', () => {
    const result = calcSellPoints(basicInput)
    // 5% yield: price 10, profit = (10-10)/10 × 100 = 0%
    const entry = result.find((r) => r.yieldPercent === 5)!
    expect(entry.profitPercent).toBe(0)
  })

  it('calculates correct profit percent (negative)', () => {
    const result = calcSellPoints(basicInput)
    // 10% yield: price 5, profit = (5-10)/10 × 100 = -50%
    expect(result[7].profitPercent).toBe(-50)
  })

  it('works with different share count', () => {
    const result = calcSellPoints({ costPerShare: 10, shares: 500, dividendPerShare: 0.5 })
    // 5% yield: price 10, total = 10 × 500 = 5000
    const entry = result.find((r) => r.yieldPercent === 5)!
    expect(entry.sellTotal).toBe(5000)
  })

  it('works with different cost per share', () => {
    const result = calcSellPoints({ costPerShare: 20, shares: 1000, dividendPerShare: 1.0 })
    // 5% yield: price 20, profit = 0%
    const entry = result.find((r) => r.yieldPercent === 5)!
    expect(entry.sellPrice).toBe(20)
    expect(entry.profitPercent).toBe(0)
  })

  it('works with high dividend (always profit)', () => {
    const result = calcSellPoints({ costPerShare: 5, shares: 100, dividendPerShare: 2.0 })
    // All sell prices should exceed cost of 5
    // 10% yield: 2.0/0.10 = 20, still above 5
    result.forEach((entry) => {
      expect(entry.profitPercent).toBeGreaterThan(0)
    })
  })

  it('rounds sell prices to 2 decimal places', () => {
    const result = calcSellPoints(basicInput)
    result.forEach((entry) => {
      const decimals = entry.sellPrice.toString().split('.')[1]
      expect(!decimals || decimals.length <= 2).toBe(true)
    })
  })

  it('throws on zero cost per share', () => {
    expect(() => calcSellPoints({ costPerShare: 0, shares: 100, dividendPerShare: 0.5 })).toThrow('Cost per share must be positive')
  })

  it('throws on negative cost per share', () => {
    expect(() => calcSellPoints({ costPerShare: -10, shares: 100, dividendPerShare: 0.5 })).toThrow('Cost per share must be positive')
  })

  it('throws on zero shares', () => {
    expect(() => calcSellPoints({ costPerShare: 10, shares: 0, dividendPerShare: 0.5 })).toThrow('Shares must be positive')
  })

  it('throws on negative shares', () => {
    expect(() => calcSellPoints({ costPerShare: 10, shares: -100, dividendPerShare: 0.5 })).toThrow('Shares must be positive')
  })

  it('throws on negative dividend', () => {
    expect(() => calcSellPoints({ costPerShare: 10, shares: 100, dividendPerShare: -0.5 })).toThrow('Dividend per share must be non-negative')
  })

  it('handles zero dividend (all sell prices are 0)', () => {
    const result = calcSellPoints({ costPerShare: 10, shares: 100, dividendPerShare: 0 })
    result.forEach((entry) => {
      expect(entry.sellPrice).toBe(0)
      expect(entry.sellTotal).toBe(0)
      expect(entry.profitPercent).toBe(-100)
    })
  })
})
