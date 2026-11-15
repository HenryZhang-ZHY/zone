import type { BoardKey, MarketSeries, YearStats } from './types'

/**
 * Formatting and chart geometry shared by the build-time page and the browser script.
 *
 * The chart draws into a `viewBox="0 0 100 100"` with a non-uniform stretch: every x
 * is the year's slot position, every y is literally the percentage. Labels live in
 * HTML around the SVG, so they keep the type scale at any width while the plot fills
 * the container.
 */

const decimal = (value: number, digits: number): string =>
  value.toLocaleString('zh-Hans', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const signed = (value: number, digits = 1): string => {
  const factor = 10 ** digits
  // The epsilon keeps printed 2dp values such as −4.95 from rounding down on
  // their binary representation; the panel rounds half away from zero.
  const rounded = (Math.sign(value) * Math.round(Math.abs(value) * factor + 1e-9)) / factor
  if (Math.abs(rounded) < 0.5 / factor) return decimal(0, digits)
  return rounded > 0 ? `+${decimal(rounded, digits)}` : `−${decimal(Math.abs(rounded), digits)}`
}

/** `21.7%`; one decimal is the panel's working precision. */
export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—'
  const factor = 10 ** digits
  const rounded = Math.round(Math.abs(value) * factor + 1e-9) / factor
  const body = decimal(Math.abs(rounded) < 0.5 / factor ? 0 : rounded, digits)
  return `${value < 0 && body !== decimal(0, digits) ? '−' : ''}${body}%`
}

/** `+3.3` / `−2.2`, with the unit left to the column header. */
export function formatDelta(value: number, digits = 1): string {
  return Number.isFinite(value) ? signed(value, digits) : '—'
}

/** `26.6–67.9` — the interquartile range without its unit. */
export function formatRange(low: number, high: number, digits = 1): string {
  return `${decimal(low, digits)}–${decimal(high, digits)}`
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('zh-Hans', { maximumFractionDigits: 0 }).format(value)
}

/** 万股 → the unit a reader can hold in their head. */
export function formatShares(hold10k: number): string {
  if (!Number.isFinite(hold10k)) return '—'
  const yi = hold10k / 1e4
  if (yi >= 1e4) return `${decimal(yi / 1e4, 2)} 万亿股`
  if (yi >= 100) return `${decimal(yi, 1)} 亿股`
  return `${decimal(yi, 2)} 亿股`
}

/** The x coordinate of a year slot, in the 0–100 viewBox. */
export function yearX(index: number, count: number): number {
  return count > 0 ? ((index + 0.5) / count) * 100 : 50
}

const pointY = (value: number): number => 100 - Math.min(100, Math.max(0, value))

const line = (points: string[]): string => (points.length < 2 ? '' : `M${points.join('L')}`)

/** Splits a series into runs of consecutive defined points. */
function runs<T>(series: (T | null)[]): { index: number; value: T }[][] {
  const all: { index: number; value: T }[][] = []
  let current: { index: number; value: T }[] = []

  series.forEach((value, index) => {
    if (value === null) {
      if (current.length > 0) all.push(current)
      current = []
      return
    }
    current.push({ index, value })
  })
  if (current.length > 0) all.push(current)

  return all
}

export interface MarketChartGeometry {
  band: string
  median: string
  weighted: string
}

/** The interquartile band and the two lines, as SVG path data. */
export function marketChartGeometry(series: MarketSeries): MarketChartGeometry {
  const count = series.length
  const x = (index: number) => yearX(index, count)

  const band = runs(series)
    .filter((run) => run.length > 1)
    .map((run) => {
      const top = run.map((point) => `${x(point.index)},${pointY(point.value.p75)}`)
      const bottom = [...run].reverse().map((point) => `${x(point.index)},${pointY(point.value.p25)}`)
      return `M${top.join('L')}L${bottom.join('L')}Z`
    })
    .join('')

  const median = runs(series)
    .map((run) => line(run.map((point) => `${x(point.index)},${pointY(point.value.median)}`)))
    .join('')

  const weighted = runs(series)
    .map((run) => line(run.map((point) => `${x(point.index)},${pointY(point.value.weightedIndividual)}`)))
    .join('')

  return { band, median, weighted }
}

/** The one-sentence reading of the latest comparable point, for the live region. */
export function marketSummary(series: MarketSeries, label: string): string {
  const stats = [...series].reverse().find((point): point is YearStats => point !== null)
  if (!stats) return `${label}：暂无数据。`

  return `${stats.year} 年末 · ${label}：自然人中位 ${formatPercent(stats.median)}，加权 ${formatPercent(
    stats.weightedIndividual,
  )}，P25–P75 ${formatRange(stats.p25, stats.p75)}%；${formatPercent(stats.over50)} 的公司超过 50%。`
}

export function marketChartLabel(series: MarketSeries, label: string): string {
  const points = series.filter((point): point is YearStats => point !== null)
  const first = points[0]
  const last = points.at(-1)
  if (!first || !last) return `自然人持股比例：${label}，暂无数据。`

  // 2007–2008 were printed on a tradable-share base; describe the run from the
  // first year the denominators are comparable.
  const comparable = points.find((point) => point.year >= 2009) ?? first
  const caveat = comparable.year > first.year ? `（${first.year}–${comparable.year - 1} 为流通股口径）` : ''

  return `自然人持股比例：${label}，${comparable.year}—${last.year} 年${caveat}。中位数从 ${formatPercent(
    comparable.median,
  )} 变为 ${formatPercent(last.median)}，按持股数加权从 ${formatPercent(
    comparable.weightedIndividual,
  )} 变为 ${formatPercent(last.weightedIndividual)}。`
}

/** The annual table rows: one per year, missing years kept as a dash. */
export function annualTableRows(years: number[], series: MarketSeries, latestYear: number): string {
  return series
    .map((stats, index) => {
      if (!stats) {
        return `<tr><th scope="row" class="panel-table__year"><span class="panel-table__year-number">${years[index]}</span><span class="panel-table__year-edition">${years[index] + 1} 卷</span></th>${'<td class="panel-table__dash-cell">—</td>'.repeat(7)}</tr>`
      }

      const current = stats.year === latestYear ? ' panel-table__row--current' : ''
      return `<tr class="panel-table__row${current}">
        <th scope="row" class="panel-table__year"><span class="panel-table__year-number">${stats.year}</span><span class="panel-table__year-edition">${stats.edition} 卷</span></th>
        <td class="panel-table__count">${formatCount(stats.count)}</td>
        <td>${formatPercent(stats.weightedIndividual)}</td>
        <td>${formatPercent(stats.median)}</td>
        <td class="panel-table__range">${formatRange(stats.p25, stats.p75)}%</td>
        <td>${formatPercent(stats.over50)}</td>
        <td>${formatPercent(stats.weightedCorporate)}</td>
        <td>${formatPercent(stats.weightedInstitution)}</td>
      </tr>`
    })
    .join('')
}

/** Board labels for the chart's caption. */
export const boardCaption: Record<BoardKey, string> = {
  all: '全部股票',
  主板A: '主板 A 股',
  科创板: '科创板',
  B股: 'B 股',
}

/** Descending rank of a value within a year: 1 is the largest. */
export function rankOf(values: number[], value: number): { rank: number; count: number } {
  let above = 0
  for (const candidate of values) if (candidate > value) above += 1
  return { rank: above + 1, count: values.length }
}
