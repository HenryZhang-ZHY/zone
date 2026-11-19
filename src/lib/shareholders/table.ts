import type { ClientCompany, ClientPayload, PanelRow } from './types'
import type { SzseClientCompany, SzseClientPayload } from './szse'
import { formatCount, formatDelta, formatPercent, formatShares } from './view'

/**
 * The one table shared by the two yearbooks.
 *
 * The Shanghai data splits holders by investor identity, the Shenzhen data by
 * holding size. Their columns are different, so the page switches datasets rather
 * than blending them. Everything below is the common row shape, the two column
 * sets, and the historical series the accordion draws.
 */

export type Market = 'sse' | 'szse'

export interface MarketInfo {
  id: Market
  label: string
  metric: string
  years: number[]
  latestYear: number
  latestCount: number
  totalRows: number
  jsonUrl: string
  csvUrl: string
  csvFilename: string
}

export interface ColumnDef {
  key: string
  label: string
  numeric: boolean
  className: string
}

const BASE_COLUMNS: readonly ColumnDef[] = [
  { key: 'code', label: '代码', numeric: false, className: 'holder-col--code' },
  { key: 'name', label: '简称', numeric: false, className: 'holder-col--name' },
  { key: 'board', label: '板块', numeric: false, className: 'holder-col--board' },
]

export const SSE_COLUMNS: readonly ColumnDef[] = [
  ...BASE_COLUMNS,
  { key: 'individual', label: '自然人 %', numeric: true, className: 'holder-col--individual' },
  { key: 'corporate', label: '一般法人 %', numeric: true, className: 'holder-col--corporate' },
  { key: 'institution', label: '专业机构 %', numeric: true, className: 'holder-col--institution' },
  { key: 'other', label: '其他 %', numeric: true, className: 'holder-col--other' },
  { key: 'total', label: '合计（亿股）', numeric: true, className: 'holder-col--total' },
]

export const SZSE_COLUMNS: readonly ColumnDef[] = [
  ...BASE_COLUMNS,
  { key: 'holders', label: '股东（户）', numeric: true, className: 'holder-col--holders' },
  { key: 'avg', label: '户均（股）', numeric: true, className: 'holder-col--avg' },
  { key: 'small', label: '＜1万 %', numeric: true, className: 'holder-col--small' },
  { key: 'mid', label: '1万–10万 %', numeric: true, className: 'holder-col--mid' },
  { key: 'large', label: '＞10万 %', numeric: true, className: 'holder-col--large' },
  { key: 'negotiable', label: '托管（亿股）', numeric: true, className: 'holder-col--negotiable' },
]

export const columnsForMarket = (market: Market): readonly ColumnDef[] =>
  market === 'sse' ? SSE_COLUMNS : SZSE_COLUMNS

/** The SSE residual is a printed zero in most years; keep the column only when it carries data. */
export function columnsForRows(market: Market, rows: readonly TableRow[]): readonly ColumnDef[] {
  const columns = columnsForMarket(market)
  if (market !== 'sse') return columns
  return rows.some((row) => Math.abs(row.sort.other ?? 0) >= 0.05)
    ? columns
    : columns.filter((column) => column.key !== 'other')
}

export interface TableRow {
  code: string
  name: string
  board: string
  aliases: string[]
  /** Preformatted text for the numeric columns. */
  cells: Record<string, string>
  /** Values used by the header sort; the identity columns use the row fields. */
  sort: Record<string, number>
}

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (character) => ENTITIES[character])

export function boardLabel(board: string): string {
  if (board === '主板A') return '主板 A'
  if (board === 'B股') return 'B 股'
  return board
}

export function tableHeadHtml(
  columns: readonly ColumnDef[],
  sortKey: string = 'code',
  direction: 'asc' | 'desc' = 'asc',
  interactive = true,
): string {
  return `<tr>${columns
    .map((column) => {
      if (!interactive) {
        return `<th scope="col" class="holder-th${column.numeric ? ' holder-th--num' : ''} ${column.className}"><span class="holder-th__static">${escapeHtml(
          column.label,
        )}</span></th>`
      }
      const active = column.key === sortKey
      const ariaSort = active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
      const mark = active ? (direction === 'asc' ? '↑' : '↓') : ''
      return `<th scope="col" class="holder-th${column.numeric ? ' holder-th--num' : ''} ${column.className}" aria-sort="${ariaSort}" data-sort-th="${column.key}"><button type="button" class="holder-th__button" data-sort="${column.key}" aria-label="按${escapeHtml(
        column.label,
      )}排序"><span>${escapeHtml(column.label)}</span><span class="holder-th__mark" data-sort-mark aria-hidden="true">${mark}</span></button></th>`
    })
    .join('')}</tr>`
}

export function tableRowHtml(
  row: TableRow,
  columns: readonly ColumnDef[],
  interactive = true,
  open = false,
  detailId?: string,
): string {
  const cells = columns
    .map((column) => {
      if (column.key === 'code') {
        return `<td class="holder-row__code ${column.className}">${row.code}</td>`
      }
      if (column.key === 'name') {
        const controls = open && detailId ? ` aria-controls="${detailId}"` : ''
        const content = interactive
          ? `<button type="button" class="holder-row__toggle" aria-expanded="${open}"${controls} data-row-toggle><span class="holder-row__name">${escapeHtml(
              row.name,
            )}</span><span class="holder-row__chevron" aria-hidden="true"></span></button>`
          : `<span class="holder-row__name">${escapeHtml(row.name)}</span>`
        return `<th scope="row" class="holder-row__name-cell ${column.className}">${content}</th>`
      }
      if (column.key === 'board') {
        return `<td class="holder-row__board ${column.className}">${escapeHtml(boardLabel(row.board))}</td>`
      }
      return `<td class="holder-row__num ${column.className}">${row.cells[column.key] ?? '—'}</td>`
    })
    .join('')

  return `<tr class="${open ? 'holder-row is-open' : 'holder-row'}" data-code="${row.code}" data-name="${escapeHtml(
    row.name,
  )}" data-board="${escapeHtml(row.board)}" data-aliases="${escapeHtml(
    row.aliases.join('|'),
  )}" data-sort="${escapeHtml(JSON.stringify(row.sort))}">${cells}</tr>`
}

export function tableEmptyRowHtml(colspan: number): string {
  return `<tr class="holder-empty" data-holder-empty><td colspan="${colspan}">没有匹配的股票。</td></tr>`
}

export function tableLoadingRowHtml(colspan: number): string {
  return `<tr class="holder-loading"><td colspan="${colspan}">正在载入数据…</td></tr>`
}

const collator = new Intl.Collator('zh-Hans', { numeric: true, sensitivity: 'base' })
const BOARD_ORDER: Record<string, number> = { 主板A: 0, 主板: 0, 科创板: 1, 创业板: 1, B股: 2, 其他: 3 }

export function normalizeQuery(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, '').trim().toLowerCase()
}

export function matchesTableRow(row: TableRow, query: string): boolean {
  const text = normalizeQuery(query)
  if (text === '') return true

  return (
    row.code.startsWith(text) ||
    normalizeQuery(row.name).includes(text) ||
    normalizeQuery(row.board).includes(text) ||
    row.aliases.some((alias) => normalizeQuery(alias).includes(text))
  )
}

/** Ascending comparison of the chosen column; ties are left to `compareForSort`. */
export function compareTableRows(first: TableRow, second: TableRow, key: string): number {
  if (key === 'code') return first.code.localeCompare(second.code)
  if (key === 'name') return collator.compare(first.name, second.name)
  if (key === 'board') return (BOARD_ORDER[first.board] ?? 9) - (BOARD_ORDER[second.board] ?? 9)
  return (first.sort[key] ?? 0) - (second.sort[key] ?? 0)
}

export function compareForSort(
  first: TableRow,
  second: TableRow,
  key: string,
  direction: 'asc' | 'desc',
): number {
  const primary = compareTableRows(first, second, key)
  if (primary !== 0) return primary * (direction === 'asc' ? 1 : -1)
  return first.code.localeCompare(second.code)
}

export function sortTableRows(rows: TableRow[], key: string, direction: 'asc' | 'desc'): TableRow[] {
  return [...rows].sort((first, second) => compareForSort(first, second, key, direction))
}

/** Shared by both markets: the latest name, the printed old names, the current name. */
type NamedCompany = { n: string; h?: [number, string][] }

export function companyNameAt(company: NamedCompany, year: number): string {
  if (!company.h?.length) return company.n

  let name = company.h[0][1]
  for (const [changeYear, changed] of company.h) {
    if (changeYear > year) break
    name = changed
  }
  return name
}

export function companyAliases(company: NamedCompany): string[] {
  return [...new Set([company.n, ...(company.h?.map(([, name]) => name) ?? [])])]
}

/* ------------------------------------------------------------------ */
/* Row builders                                                        */
/* ------------------------------------------------------------------ */

/** The server-rendered preview and the browser use the same row shape. */
export function ssePanelRowToTableRow(row: PanelRow, aliases: string[]): TableRow {
  return {
    code: String(row.code).padStart(6, '0'),
    name: row.name,
    board: row.board,
    aliases,
    cells: {
      individual: formatPercent(row.individualPct),
      corporate: formatPercent(row.corporatePct),
      institution: formatPercent(row.institutionPct),
      other: formatPercent(row.otherPct),
      total: formatShares(row.totalHold10k),
    },
    sort: {
      individual: row.individualPct,
      corporate: row.corporatePct,
      institution: row.institutionPct,
      other: row.otherPct,
      total: row.totalHold10k / 1e4,
    },
  }
}

export function sseTableRows(payload: ClientPayload, year: number): TableRow[] {
  const index = payload.years.indexOf(year)
  if (index < 0) return []

  const rows: TableRow[] = []
  for (const company of payload.companies) {
    const row = company.r[index]
    if (!row) continue
    const [totalYi, individual, corporate, institution, other] = row
    rows.push({
      code: company.c,
      name: companyNameAt(company, year),
      board: company.b,
      aliases: companyAliases(company),
      cells: {
        individual: formatPercent(individual),
        corporate: formatPercent(corporate),
        institution: formatPercent(institution),
        other: formatPercent(other),
        total: formatShares(totalYi * 1e4),
      },
      sort: { individual, corporate, institution, other, total: totalYi },
    })
  }

  return rows
}

export function szseTableRows(payload: SzseClientPayload, year: number): TableRow[] {
  const index = payload.years.indexOf(year)
  if (index < 0) return []

  const rows: TableRow[] = []
  for (const company of payload.companies) {
    const row = company.r[index]
    if (!row) continue
    const [negotiableYi, holders, avgHold, pLt1k, p1k5k, p5k10k, p10k50k, p50k100k, pGt100k] = row
    const small = pLt1k + p1k5k + p5k10k
    const mid = p10k50k + p50k100k
    const large = pGt100k

    rows.push({
      code: company.c,
      name: companyNameAt(company, year),
      board: company.b,
      aliases: companyAliases(company),
      cells: {
        holders: formatCount(holders),
        avg: formatCount(avgHold),
        small: formatPercent(small),
        mid: formatPercent(mid),
        large: formatPercent(large),
        negotiable: formatShares(negotiableYi * 1e4),
      },
      sort: { holders, avg: avgHold, small, mid, large, negotiable: negotiableYi },
    })
  }

  return rows
}

/* ------------------------------------------------------------------ */
/* SSE: investor identity over time                                    */
/* ------------------------------------------------------------------ */

export type HistoryKey = 'individual' | 'corporate' | 'institution' | 'other'

export const HISTORY_KEYS: readonly HistoryKey[] = ['individual', 'corporate', 'institution', 'other']

export const HISTORY_LABELS: Record<HistoryKey, string> = {
  individual: '自然人',
  corporate: '一般法人',
  institution: '专业机构',
  other: '其他',
}

export interface HistoryPoint {
  year: number
  totalYi: number
  individual: number
  corporate: number
  institution: number
  other: number
}

export type History = (HistoryPoint | null)[]

export function buildHistory(company: ClientCompany, years: number[]): History {
  return years.map((year, index) => {
    const row = company.r[index]
    return row
      ? {
          year,
          totalYi: row[0],
          individual: row[1],
          corporate: row[2],
          institution: row[3],
          other: row[4],
        }
      : null
  })
}

/** The x coordinate of a year slot in the 0–100 viewBox, matching the axis cells. */
export function historyX(index: number, count: number): number {
  return count > 0 ? ((index + 0.5) / count) * 100 : 50
}

export function historyY(value: number): number {
  return 100 - Math.min(100, Math.max(0, value))
}

/** One path per run of consecutive years; missing years break the line. */
export function historyPath(history: History, key: HistoryKey): string {
  const paths: string[] = []
  let points: string[] = []

  const flush = () => {
    if (points.length > 1) paths.push(`M${points.join('L')}`)
    points = []
  }

  history.forEach((point, index) => {
    if (!point) {
      flush()
      return
    }
    points.push(`${historyX(index, history.length).toFixed(3)},${historyY(point[key]).toFixed(3)}`)
  })
  flush()

  return paths.join('')
}

export function historyLatest(history: History, key: HistoryKey): { index: number; value: number } | null {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const point = history[index]
    if (point) return { index, value: point[key] }
  }
  return null
}

export function firstComparable(history: History): HistoryPoint | null {
  const points = history.filter((point): point is HistoryPoint => point !== null)
  return points.find((point) => point.year >= 2009) ?? points[0] ?? null
}

export function lastPoint(history: History): HistoryPoint | null {
  return [...history].reverse().find((point): point is HistoryPoint => point !== null) ?? null
}

/** The sentence above the chart: what moved between the first comparable year and now. */
export function historySummary(history: History): string {
  const first = firstComparable(history)
  const last = lastPoint(history)
  if (!first || !last) return '没有可展示的历史记录。'
  if (first.year === last.year) {
    const count = history.filter((point) => point !== null).length
    return count > 1
      ? `${last.year} 年末是第一个可比较年份；更早年份为流通股口径，不参与变化计算。`
      : `只有 ${last.year} 年末一条记录，尚无可比较的年份。`
  }

  return `${first.year}–${last.year} 年末：自然人 ${formatDelta(last.individual - first.individual)}pp，一般法人 ${formatDelta(
    last.corporate - first.corporate,
  )}pp，专业机构 ${formatDelta(last.institution - first.institution)}pp。`
}

export function historyAriaLabel(name: string, history: History): string {
  const first = firstComparable(history)
  const last = lastPoint(history)
  if (!first || !last) return `${name} 的历年股东结构暂无可读数据。`
  if (first.year === last.year) {
    return `${name} ${last.year} 年末的股东结构：自然人 ${formatPercent(last.individual)}，一般法人 ${formatPercent(
      last.corporate,
    )}，专业机构 ${formatPercent(last.institution)}。`
  }
  return `${name} ${first.year} 到 ${last.year} 年末的股东结构折线图：自然人从 ${formatPercent(
    first.individual,
  )} 变为 ${formatPercent(last.individual)}，一般法人从 ${formatPercent(first.corporate)} 变为 ${formatPercent(
    last.corporate,
  )}，专业机构从 ${formatPercent(first.institution)} 变为 ${formatPercent(last.institution)}。`
}

/* ------------------------------------------------------------------ */
/* SZSE: holding size over time                                        */
/* ------------------------------------------------------------------ */

export interface SzseHistoryPoint {
  year: number
  negotiableYi: number
  holders: number
  avgHold: number
  small: number
  mid: number
  large: number
  /** The six printed buckets, for the exact yearly table. */
  buckets: [number, number, number, number, number, number]
}

export type SzseHistory = (SzseHistoryPoint | null)[]

export function buildSzseHistory(company: SzseClientCompany, years: number[]): SzseHistory {
  return years.map((year, index) => {
    const row = company.r[index]
    if (!row) return null
    const [negotiableYi, holders, avgHold, pLt1k, p1k5k, p5k10k, p10k50k, p50k100k, pGt100k] = row
    return {
      year,
      negotiableYi,
      holders,
      avgHold,
      small: pLt1k + p1k5k + p5k10k,
      mid: p10k50k + p50k100k,
      large: pGt100k,
      buckets: [pLt1k, p1k5k, p5k10k, p10k50k, p50k100k, pGt100k],
    }
  })
}

export function szseLastPoint(history: SzseHistory): SzseHistoryPoint | null {
  return [...history].reverse().find((point): point is SzseHistoryPoint => point !== null) ?? null
}

export function szseHistorySummary(history: SzseHistory): string {
  const points = history.filter((point): point is SzseHistoryPoint => point !== null)
  const first = points[0]
  const last = points.at(-1)
  if (!last) return '没有可展示的历史记录。'
  if (!first || first.year === last.year) {
    return `只有 ${last.year} 年末一条记录：${formatCount(last.holders)} 户股东，户均 ${formatCount(
      last.avgHold,
    )} 股，10 万股以上占 ${formatPercent(last.large)}。`
  }

  return `${last.year} 年末：${formatCount(last.holders)} 户股东，户均 ${formatCount(last.avgHold)} 股；10 万股以上占 ${formatPercent(
    last.large,
  )}（${first.year} 年为 ${formatPercent(first.large)}，${formatDelta(last.large - first.large)}pp）。`
}

export function szseHistoryAriaLabel(name: string, history: SzseHistory): string {
  const points = history.filter((point): point is SzseHistoryPoint => point !== null)
  const first = points[0]
  const last = points.at(-1)
  if (!last) return `${name} 的历年持股规模暂无可读数据。`
  if (!first || first.year === last.year) {
    return `${name} ${last.year} 年末：${formatCount(last.holders)} 户股东，户均 ${formatCount(
      last.avgHold,
    )} 股，10 万股以上占 ${formatPercent(last.large)}。`
  }
  return `${name} ${first.year} 到 ${last.year} 年末的持股规模图：10 万股以上占比从 ${formatPercent(
    first.large,
  )} 变为 ${formatPercent(last.large)}，股东数从 ${formatCount(first.holders)} 户变为 ${formatCount(last.holders)} 户。`
}
