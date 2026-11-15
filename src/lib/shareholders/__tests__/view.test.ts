import { describe, expect, it } from 'vitest'
import type { MarketSeries, YearStats } from '../types'
import {
  annualTableRows,
  formatCount,
  formatDelta,
  formatPercent,
  formatRange,
  formatShares,
  marketChartGeometry,
  marketChartLabel,
  marketSummary,
  rankOf,
  yearX,
} from '../view'

const point = (year: number, median: number, p25: number, p75: number, weighted: number): YearStats => ({
  year,
  edition: year + 1,
  count: 100,
  totalHold10k: 1_000_000,
  weightedIndividual: weighted,
  weightedCorporate: 60,
  weightedInstitution: 20,
  weightedOther: 0,
  median,
  p25,
  p75,
  over50: 40,
  over80: 10,
  under20: 20,
  institutionMedian: 5,
})

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
    expect(formatRange(26.62, 67.93)).toBe('26.6–67.9')
  })
})

describe('market chart geometry', () => {
  it('places the first and last year half a slot inside the plot', () => {
    expect(yearX(0, 18)).toBeCloseTo(2.777777, 5)
    expect(yearX(17, 18)).toBeCloseTo(97.222222, 5)
  })

  it('closes the interquartile band and splits lines on missing years', () => {
    const series: MarketSeries = [
      point(2007, 80, 60, 90, 60),
      point(2008, 75, 55, 88, 52),
      null,
      point(2010, 52, 35, 70, 21),
      point(2011, 50, 34, 67, 20),
    ]
    const geometry = marketChartGeometry(series)

    expect(geometry.band.match(/M/g)).toHaveLength(2)
    expect(geometry.band.endsWith('Z')).toBe(true)
    expect(geometry.median.match(/M/g)).toHaveLength(2)
    expect(geometry.median).toBe('M10,20L30,25M70,48L90,50')
    expect(geometry.weighted).toBe('M10,40L30,48M70,79L90,80')
  })

  it('maps percentages into the 0–100 viewBox and clamps overflow', () => {
    const geometry = marketChartGeometry([point(2024, 45, 25, 70, 120)])
    expect(geometry.band).toBe('')
    expect(geometry.median).toBe('')
    const onePoint = marketChartGeometry([point(2024, 45, 25, 70, 21), point(2025, 50, 30, 75, 22)])
    expect(onePoint.median).toBe('M25,55L75,50')
  })
})

describe('market reading', () => {
  const series: MarketSeries = [point(2007, 80, 60, 90, 60), null, point(2009, 57, 38, 76, 24)]

  it('summarise the latest comparable year', () => {
    expect(marketSummary(series, '全部')).toContain('2009 年末')
    expect(marketSummary(series, '全部')).toContain('自然人中位 57.0%')
  })

  it('labels the chart from 2009 when early years were on another basis', () => {
    const label = marketChartLabel(series, '全部')
    expect(label).toContain('2009—2009 年')
    expect(label).toContain('流通股口径')
  })

  it('renders one table row per year and dashes the missing ones', () => {
    const html = annualTableRows([2007, 2008, 2009], series, 2009)
    expect(html.match(/<tr/g)).toHaveLength(3)
    expect(html).toContain('2008')
    expect(html).toContain('2009 卷')
    expect(html).toContain('panel-table__dash-cell')
    expect(html).toContain('panel-table__row--current')
  })

  it('ranks descending values and shares a rank on ties', () => {
    expect(rankOf([10, 20, 30], 20)).toEqual({ rank: 2, count: 3 })
    expect(rankOf([10, 20, 20], 20)).toEqual({ rank: 1, count: 3 })
  })
})
