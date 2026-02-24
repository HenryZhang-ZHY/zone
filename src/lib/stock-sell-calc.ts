/**
 * Stock Selling Point Calculator
 *
 * Given a purchase cost, number of shares, and dividend per share,
 * calculates selling prices and shares for dividend yield rates from 3% to 10%.
 *
 * Dividend yield = dividend per share / selling price
 * => selling price = dividend per share / dividend yield rate
 *
 * Total selling value = selling price × shares held
 */

export interface StockSellInput {
  /** 买入成本（每股价格） */
  costPerShare: number
  /** 持有股票份额 */
  shares: number
  /** 每股分红金额 */
  dividendPerShare: number
}

export interface SellPoint {
  /** 股息率（百分比，如 3 表示 3%） */
  yieldPercent: number
  /** 对应的卖出价格 */
  sellPrice: number
  /** 卖出总金额 */
  sellTotal: number
  /** 相对买入成本的盈亏比例（百分比） */
  profitPercent: number
}

/**
 * Calculate the selling price for a given dividend yield rate.
 *
 * selling price = dividend per share / yield rate
 */
export function calcSellPrice(dividendPerShare: number, yieldRate: number): number {
  if (yieldRate <= 0) {
    throw new Error('Yield rate must be positive')
  }
  if (dividendPerShare < 0) {
    throw new Error('Dividend per share must be non-negative')
  }
  return dividendPerShare / yieldRate
}

/**
 * Calculate the profit percentage relative to cost.
 *
 * profit% = (sellPrice - costPerShare) / costPerShare × 100
 */
export function calcProfitPercent(sellPrice: number, costPerShare: number): number {
  if (costPerShare <= 0) {
    throw new Error('Cost per share must be positive')
  }
  return ((sellPrice - costPerShare) / costPerShare) * 100
}

/**
 * Generate sell-point entries for dividend yield rates from 3% to 10%.
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

  for (let pct = 3; pct <= 10; pct++) {
    const yieldRate = pct / 100
    const sellPrice = calcSellPrice(input.dividendPerShare, yieldRate)
    const sellTotal = sellPrice * input.shares
    const profitPercent = calcProfitPercent(sellPrice, input.costPerShare)

    results.push({
      yieldPercent: pct,
      sellPrice: Math.round(sellPrice * 100) / 100,
      sellTotal: Math.round(sellTotal * 100) / 100,
      profitPercent: Math.round(profitPercent * 100) / 100,
    })
  }

  return results
}
