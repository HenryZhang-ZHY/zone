/**
 * View model for the sell-point sheet.
 *
 * The calculator's data has two axes: how many shares you sell (lots) and the
 * target dividend yield. `calcSellPoints` returns the same data as a long list
 * of six-column rows; the sheet groups it so each axis is read once, in a
 * header, instead of repeated in every row.
 *
 * Columns are deciles of the position, rounded down to a 100-share lot, so the
 * sheet stays nine columns wide from 1,000 shares to a million. Each cell is the
 * sell price that makes the remaining shares yield the row's percentage.
 */

import { calcSellPriceForDilution } from './stock-sell-calc'

export const MIN_YIELD_PERCENT = 4
export const MAX_YIELD_PERCENT = 100
export const LOT_SIZE = 100
export const SHEET_BAND_SIZE = 15

export interface SheetInput {
  costPerShare: number
  shares: number
  dividendPerShare: number
}

export interface SellColumn {
  /** Shares sold in this column. Always a multiple of 100. */
  sellShares: number
  /** Shares left after the sale. */
  remainingShares: number
  /** True for the lot the reader pinned in the sheet header. */
  custom?: boolean
}

export interface SellRow {
  /** Target dividend yield, in whole percent. */
  yieldPercent: number
  /** Target diluted cost = dividend ÷ yield. */
  dilutedCost: number
  /** One price per column, in the same order as `SellSheet.columns`. */
  prices: (number | null)[]
}

export interface SellSheet {
  columns: SellColumn[]
  rows: SellRow[]
  /** Dividend ÷ cost, the yield the position has today. */
  costYieldPercent: number
  /** Shares × cost. */
  totalCost: number
  /** Shares × dividend. */
  annualDividend: number
  /** Largest sellable lot count that still leaves 100 shares. */
  maxSellShares: number
}

/** The most shares a sale may take while keeping the 100-share floor. */
export function maxSellableShares(shares: number): number {
  const max = Math.floor(shares / LOT_SIZE) * LOT_SIZE - LOT_SIZE
  return max >= LOT_SIZE ? max : 0
}

/**
 * Deciles of the position, floored to 100-share lots. Small positions collapse
 * to one column; a position that cannot leave 100 shares has none.
 */
export function sellColumns(shares: number): SellColumn[] {
  const maxSell = maxSellableShares(shares)
  if (maxSell < LOT_SIZE) return []

  const lots = new Set<number>()
  for (let percent = 10; percent <= 90; percent += 10) {
    const raw = Math.floor((shares * percent) / 100 / LOT_SIZE) * LOT_SIZE
    lots.add(Math.min(maxSell, Math.max(LOT_SIZE, raw)))
  }

  return [...lots]
    .sort((a, b) => a - b)
    .map((sellShares) => ({ sellShares, remainingShares: shares - sellShares }))
}

/** The first whole-percent yield that can produce a price above cost. */
export function firstViableYield(costPerShare: number, dividendPerShare: number): number {
  if (!(costPerShare > 0) || !(dividendPerShare >= 0)) return MAX_YIELD_PERCENT + 1
  const costYield = (dividendPerShare / costPerShare) * 100
  return Math.max(MIN_YIELD_PERCENT, Math.floor(costYield + 1e-9) + 1)
}

/** A pinned lot has to be a whole 100-share lot that still leaves 100 shares. */
export function isValidSellLot(lot: number, shares: number): boolean {
  return (
    Number.isInteger(lot) &&
    lot >= LOT_SIZE &&
    lot % LOT_SIZE === 0 &&
    lot <= maxSellableShares(shares)
  )
}

/**
 * The sheet's columns: deciles of the position, with the reader's pinned lot
 * taking the place of the nearest decile. The deciles are a sample, so swapping
 * one for the lot the reader cares about keeps the sheet nine columns wide and
 * in ascending order. A pinned lot that is already a decile is just marked.
 */
export function sheetColumns(shares: number, customLot?: number | null): SellColumn[] {
  const columns = sellColumns(shares)
  if (columns.length === 0 || customLot === null || customLot === undefined) return columns
  if (!isValidSellLot(customLot, shares)) return columns

  const exact = columns.findIndex((column) => column.sellShares === customLot)
  if (exact >= 0) {
    return columns.map((column, index) => (index === exact ? { ...column, custom: true } : column))
  }

  let nearest = 0
  for (let index = 1; index < columns.length; index += 1) {
    if (Math.abs(columns[index].sellShares - customLot) < Math.abs(columns[nearest].sellShares - customLot)) {
      nearest = index
    }
  }

  return columns.map((column, index) =>
    index === nearest
      ? { sellShares: customLot, remainingShares: shares - customLot, custom: true }
      : column,
  )
}

export function buildSellSheet(input: SheetInput, customLot?: number | null): SellSheet {
  const { costPerShare, shares, dividendPerShare } = input
  const columns = sheetColumns(shares, customLot)
  const costYieldPercent = costPerShare > 0 ? (dividendPerShare / costPerShare) * 100 : 0
  const maxSellShares = maxSellableShares(shares)

  if (columns.length === 0) {
    return {
      columns: [],
      rows: [],
      costYieldPercent,
      totalCost: costPerShare * shares,
      annualDividend: dividendPerShare * shares,
      maxSellShares,
    }
  }

  const first = firstViableYield(costPerShare, dividendPerShare)
  const rows: SellRow[] = []

  for (let yieldPercent = first; yieldPercent <= MAX_YIELD_PERCENT; yieldPercent += 1) {
    const dilutedCost = dividendPerShare / (yieldPercent / 100)
    const prices = columns.map((column) => {
      const price = calcSellPriceForDilution(costPerShare, shares, column.sellShares, dilutedCost)
      return Number.isFinite(price) && price > costPerShare ? price : null
    })

    if (prices.every((price) => price === null)) continue
    rows.push({ yieldPercent, dilutedCost, prices })
  }

  return {
    columns,
    rows,
    costYieldPercent,
    totalCost: costPerShare * shares,
    annualDividend: dividendPerShare * shares,
    maxSellShares,
  }
}

/** The percentage a sell price sits above the buy cost. */
export function profitPercent(price: number, costPerShare: number): number {
  if (!(costPerShare > 0)) return 0
  return ((price - costPerShare) / costPerShare) * 100
}

const money = new Intl.NumberFormat('zh-Hans', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const whole = new Intl.NumberFormat('zh-Hans', { maximumFractionDigits: 0 })

export function formatPrice(value: number): string {
  return money.format(value)
}

export function formatPercent(value: number, digits = 2): string {
  return `${value.toLocaleString('zh-Hans', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`
}

export function formatSignedPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${formatPercent(value)}`
}

export function formatShares(value: number): string {
  return whole.format(value)
}
