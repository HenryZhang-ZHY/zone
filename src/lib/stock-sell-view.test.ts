import { describe, expect, it } from 'vitest'
import { calcSellPoints } from './stock-sell-calc'
import {
  buildSellSheet,
  firstViableYield,
  formatPercent,
  formatPrice,
  formatSignedPercent,
  isValidSellLot,
  maxSellableShares,
  profitPercent,
  sellColumns,
} from './stock-sell-view'

describe('sellColumns', () => {
  it('uses deciles of the position in 100-share lots', () => {
    expect(sellColumns(1000).map((column) => column.sellShares)).toEqual([
      100, 200, 300, 400, 500, 600, 700, 800, 900,
    ])
    expect(sellColumns(1000).at(0)).toEqual({ sellShares: 100, remainingShares: 900 })
  })

  it('collapses a small position to the one lot it can sell', () => {
    expect(sellColumns(200).map((column) => column.sellShares)).toEqual([100])
    expect(sellColumns(250).map((column) => column.sellShares)).toEqual([100])
  })

  it('returns nothing when 100 shares cannot be left after a sale', () => {
    expect(sellColumns(150)).toEqual([])
    expect(sellColumns(199)).toEqual([])
  })

  it('never sells more than the 100-share floor allows', () => {
    const columns = sellColumns(1999)
    expect(columns).toHaveLength(9)
    expect(columns.every((column) => column.remainingShares >= 100)).toBe(true)
    expect(columns.at(-1)?.sellShares).toBe(1700)
  })
})

describe('maxSellableShares', () => {
  it('rounds down to whole lots and keeps 100 shares', () => {
    expect(maxSellableShares(1000)).toBe(900)
    expect(maxSellableShares(205)).toBe(100)
    expect(maxSellableShares(120)).toBe(0)
  })
})

describe('firstViableYield', () => {
  it('starts above the current cost yield because the sheet only lists profitable sales', () => {
    expect(firstViableYield(10, 0.5)).toBe(6)
    expect(firstViableYield(10, 0.25)).toBe(4)
    expect(firstViableYield(10, 10)).toBe(101)
  })

  it('treats a zero dividend as a zero cost yield', () => {
    expect(firstViableYield(10, 0)).toBe(4)
  })
})

describe('buildSellSheet', () => {
  const input = { costPerShare: 10, shares: 1000, dividendPerShare: 0.5 }

  it('lists one row per viable whole-percent yield', () => {
    const sheet = buildSellSheet(input)
    expect(sheet.rows).toHaveLength(95)
    expect(sheet.rows[0].yieldPercent).toBe(6)
    expect(sheet.rows.at(-1)?.yieldPercent).toBe(100)
  })

  it('puts the target diluted cost on the row and one price per column', () => {
    const sheet = buildSellSheet(input)
    const row = sheet.rows[0]
    expect(row.dilutedCost).toBeCloseTo(0.5 / 0.06, 10)
    expect(row.prices).toHaveLength(9)
    expect(row.prices[0]?.toFixed(2)).toBe('25.00')
    expect(row.prices.at(-1)?.toFixed(2)).toBe('10.19')
  })

  it('agrees with calcSellPoints for every cell it shares', () => {
    const sheet = buildSellSheet(input)
    const points = calcSellPoints(input)
    const byKey = new Map(points.map((point) => [`${point.yieldPercent}-${point.sharesToSell}`, point]))

    for (const row of sheet.rows) {
      for (const [index, price] of row.prices.entries()) {
        const column = sheet.columns[index]
        const point = byKey.get(`${row.yieldPercent}-${column.sellShares}`)
        expect(point, `${row.yieldPercent}% / ${column.sellShares} shares`).toBeDefined()
        expect(Math.round(price! * 100) / 100).toBe(point!.sellPrice)
      }
    }
  })

  it('keeps the derived facts the page shows next to the inputs', () => {
    const sheet = buildSellSheet(input)
    expect(sheet.costYieldPercent).toBe(5)
    expect(sheet.totalCost).toBe(10000)
    expect(sheet.annualDividend).toBe(500)
    expect(sheet.maxSellShares).toBe(900)
  })

  it('stays empty when the position cannot sell a lot', () => {
    const sheet = buildSellSheet({ costPerShare: 10, shares: 150, dividendPerShare: 0.5 })
    expect(sheet.rows).toEqual([])
    expect(sheet.columns).toEqual([])
  })

  it('has no rows once the cost yield reaches 100%', () => {
    const sheet = buildSellSheet({ costPerShare: 10, shares: 1000, dividendPerShare: 10 })
    expect(sheet.rows).toEqual([])
  })

  it('still lists a zero-dividend sheet, where every target cost is zero', () => {
    const sheet = buildSellSheet({ costPerShare: 10, shares: 1000, dividendPerShare: 0 })
    expect(sheet.rows).toHaveLength(97)
    expect(sheet.rows[0].dilutedCost).toBe(0)
    expect(sheet.rows[0].prices[0]).toBe(100)
  })
})

describe('pinned sell lot', () => {
  const input = { costPerShare: 10, shares: 10000, dividendPerShare: 1 }

  it('swaps the nearest decile for any valid 100-share lot, keeping the order', () => {
    const sheet = buildSellSheet(input, 8400)
    expect(sheet.columns.map((column) => column.sellShares)).toEqual([
      1000, 2000, 3000, 4000, 5000, 6000, 7000, 8400, 9000,
    ])
    const pinned = sheet.columns.find((column) => column.custom)
    expect(pinned).toEqual({ sellShares: 8400, remainingShares: 1600, custom: true })
  })

  it('computes the pinned column with the same formula as the rest', () => {
    const sheet = buildSellSheet(input, 8400)
    const index = sheet.columns.findIndex((column) => column.sellShares === 8400)
    const row = sheet.rows[0]
    const targetCost = 1 / (row.yieldPercent / 100)
    expect(row.prices[index]).toBeCloseTo((10000 * 10 - 1600 * targetCost) / 8400, 8)
  })

  it('marks a pinned lot that is already a decile instead of repeating it', () => {
    const sheet = buildSellSheet(input, 8000)
    expect(sheet.columns).toHaveLength(9)
    expect(sheet.columns.filter((column) => column.custom)).toHaveLength(1)
    expect(sheet.columns.find((column) => column.custom)?.sellShares).toBe(8000)
  })

  it('ignores a lot that is not a whole 100-share lot, or breaks the floor', () => {
    const invalid = [8450, 50, 0, 9950, 10000]
    for (const lot of invalid) {
      const sheet = buildSellSheet(input, lot)
      expect(sheet.columns).toHaveLength(9)
      expect(sheet.columns.some((column) => column.custom)).toBe(false)
    }
  })

  it('validates the lot against the position', () => {
    expect(isValidSellLot(8400, 10000)).toBe(true)
    expect(isValidSellLot(9900, 10000)).toBe(true)
    expect(isValidSellLot(100, 1000)).toBe(true)
    expect(isValidSellLot(8450, 10000)).toBe(false)
    expect(isValidSellLot(1000, 1000)).toBe(false)
  })
})

describe('formatters', () => {
  it('formats money, percentages and signed changes', () => {
    expect(formatPrice(13.8888)).toBe('13.89')
    expect(formatPrice(10000)).toBe('10,000.00')
    expect(formatPercent(5)).toBe('5.00%')
    expect(formatSignedPercent(38.8888)).toBe('+38.89%')
    expect(formatSignedPercent(0)).toBe('0.00%')
    expect(profitPercent(13.89, 10)).toBeCloseTo(38.9, 1)
  })
})
