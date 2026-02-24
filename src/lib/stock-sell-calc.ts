/**
 * Stock Selling Point Calculator
 *
 * Calculates sell prices that dilute the effective holding cost of remaining
 * shares to match a target dividend yield, by partially selling the position.
 *
 * Strategy: sell M shares at price P so that the remaining (N - M) shares
 * have a diluted cost equal to targetCost (= dividend / target_yield).
 *
 * Formula:
 *   diluted_cost = (N × C - M × P) / (N - M) = dividend / target_yield
 *   → P = (N × C - (N - M) × targetCost) / M
 *
 * Only results where P > C (profitable sell) are included.
 * M is enumerated in lots of 100, from 1 lot to (total lots - 1) lots.
 * Target yield rates run from 4% to 100% in 1% steps.
 */

export interface StockSellInput {
  /** 买入成本（每股价格） */
  costPerShare: number
  /** 持有股票份额（股） */
  shares: number
  /** 每股分红金额 */
  dividendPerShare: number
}

export interface SellPoint {
  /** 目标股息率（百分比，如 8 表示 8%） */
  yieldPercent: number
  /** 计划卖出份额（股） */
  sharesToSell: number
  /** 需要达到的卖出价格（元/股） */
  sellPrice: number
  /** 卖出后剩余份额（股） */
  remainingShares: number
  /** 目标摊薄成本（= 每股分红 ÷ 目标股息率） */
  dilutedCost: number
  /** 相对买入成本的盈利比例（百分比，仅含 > 0 的结果） */
  profitPercent: number
}

/**
 * Calculate the target cost per share corresponding to a dividend yield.
 *
 * targetCost = dividendPerShare / yieldRate
 */
export function calcTargetCost(dividendPerShare: number, yieldRate: number): number {
  if (yieldRate <= 0) {
    throw new Error('Yield rate must be positive')
  }
  if (dividendPerShare < 0) {
    throw new Error('Dividend per share must be non-negative')
  }
  return dividendPerShare / yieldRate
}

/**
 * Calculate the sell price needed so that the remaining shares' diluted cost
 * equals targetCost.
 *
 * P = (N × C - (N - M) × targetCost) / M
 */
export function calcSellPriceForDilution(
  costPerShare: number,
  shares: number,
  sharesToSell: number,
  targetCost: number,
): number {
  if (costPerShare <= 0) {
    throw new Error('Cost per share must be positive')
  }
  if (shares <= 0) {
    throw new Error('Shares must be positive')
  }
  if (sharesToSell <= 0 || sharesToSell >= shares) {
    throw new Error('Shares to sell must be between 0 and total shares (exclusive)')
  }
  if (targetCost < 0) {
    throw new Error('Target cost must be non-negative')
  }
  const remaining = shares - sharesToSell
  return (shares * costPerShare - remaining * targetCost) / sharesToSell
}

/**
 * Generate all profitable sell-point entries.
 *
 * Enumerates M (shares to sell) in lots of 100, and target yield from 4% to 100%.
 * Only includes entries where sell price > cost per share (profitable).
 * Results are sorted by yield rate ascending, then by sharesToSell ascending.
 */
export function calcSellPoints(input: StockSellInput): SellPoint[] {
  if (input.costPerShare <= 0) {
    throw new Error('Cost per share must be positive')
  }
  if (input.shares <= 0) {
    throw new Error('Shares must be positive')
  }
  if (input.dividendPerShare < 0) {
    throw new Error('Dividend per share must be non-negative')
  }

  const results: SellPoint[] = []

  // M must be a multiple of 100; must leave at least 100 shares after selling
  const maxSell = Math.floor(input.shares / 100) * 100 - 100
  if (maxSell < 100) {
    return results // not enough shares for even 1 lot to sell
  }

  for (let pct = 4; pct <= 100; pct++) {
    const yieldRate = pct / 100
    const targetCost = calcTargetCost(input.dividendPerShare, yieldRate)

    for (let m = 100; m <= maxSell; m += 100) {
      const sellPrice = calcSellPriceForDilution(
        input.costPerShare,
        input.shares,
        m,
        targetCost,
      )

      if (sellPrice <= input.costPerShare) continue // not profitable

      const remaining = input.shares - m
      const profitPercent = ((sellPrice - input.costPerShare) / input.costPerShare) * 100

      results.push({
        yieldPercent: pct,
        sharesToSell: m,
        sellPrice: Math.round(sellPrice * 100) / 100,
        remainingShares: remaining,
        dilutedCost: Math.round(targetCost * 100) / 100,
        profitPercent: Math.round(profitPercent * 100) / 100,
      })
    }
  }

  return results
}
