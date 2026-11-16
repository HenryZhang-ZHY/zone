import type { Board, ClientCompany, ClientPayload, PanelRow } from './types'
import { formatDelta, formatPercent, formatShares } from './view'

/**
 * The one table on the shareholder page, and the one chart inside its accordion.
 *
 * A row is deliberately plain data: the server renders the latest year from
 * `PanelRow`s, the browser rebuilds other years from `ClientCompany`s, and both
 * paths print the same markup through `tableRowHtml`.
 */

export type SortKey =
  | 'code'
  | 'name'
  | 'board'
  | 'individual'
  | 'corporate'
  | 'institution'
  | 'other'
  | 'total'

export interface TableColumn {
  key: SortKey
  label: string
  numeric: boolean
  className: string
}

/** Reading order: identity, then the composition, then the size. */
export const TABLE_COLUMNS: readonly TableColumn[] = [
  { key: 'code', label: '代码', numeric: false, className: 'holder-col--code' },
  { key: 'name', label: '简称', numeric: false, className: 'holder-col--name' },
  { key: 'board', label: '板块', numeric: false, className: 'holder-col--board' },
  { key: 'individual', label: '自然人 %', numeric: true, className: 'holder-col--individual' },
  { key: 'corporate', label: '一般法人 %', numeric: true, className: 'holder-col--corporate' },
  { key: 'institution', label: '专业机构 %', numeric: true, className: 'holder-col--institution' },
  { key: 'other', label: '其他 %', numeric: true, className: 'holder-col--other' },
  { key: 'total', label: '合计（亿股）', numeric: true, className: 'holder-col--total' },
]

/** First click on a number means "the biggest", on text "the alphabet". */
export const NUMERIC_SORT_KEYS: readonly SortKey[] = ['individual', 'corporate', 'institution', 'other', 'total']

export const SORT_LABELS: Record<SortKey, string> = {
  code: '代码',
  name: '简称',
  board: '板块',
  individual: '自然人持股比例',
  corporate: '一般法人持股比例',
  institution: '专业机构持股比例',
  other: '其他持股比例',
  total: '合计持股',
}

export interface TableRow {
  code: string
  name: string
  board: Board
  aliases: string[]
  totalYi: number
  individual: number
  corporate: number
  institution: number
  other: number
}

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (character) => ENTITIES[character])

export function boardLabel(board: Board): string {
  return board === '主板A' ? '主板 A' : board === 'B股' ? 'B 股' : board
}

/** One printed panel row → the row the table and its sorter use. */
export function panelRowToTableRow(row: PanelRow, aliases: string[]): TableRow {
  return {
    code: String(row.code).padStart(6, '0'),
    name: row.name,
    board: row.board,
    aliases,
    totalYi: Math.round((row.totalHold10k / 1e4) * 100) / 100,
    individual: row.individualPct,
    corporate: row.corporatePct,
    institution: row.institutionPct,
    other: row.otherPct,
  }
}

/** The server-rendered row: every cell the browser may later sort on is in a data attribute. */
export function tableRowHtml(row: TableRow): string {
  const aliases = row.aliases.join('|')
  return `<tr class="holder-row" data-code="${row.code}" data-name="${escapeHtml(row.name)}" data-board="${row.board}" data-aliases="${escapeHtml(aliases)}" data-individual="${row.individual}" data-corporate="${row.corporate}" data-institution="${row.institution}" data-other="${row.other}" data-total="${row.totalYi}">
  <td class="holder-row__code holder-col--code">${row.code}</td>
  <th scope="row" class="holder-row__name-cell holder-col--name"><button type="button" class="holder-row__toggle" aria-expanded="false" data-row-toggle><span class="holder-row__name">${escapeHtml(row.name)}</span><span class="holder-row__chevron" aria-hidden="true"></span></button></th>
  <td class="holder-row__board holder-col--board">${boardLabel(row.board)}</td>
  <td class="holder-row__num holder-col--individual">${formatPercent(row.individual)}</td>
  <td class="holder-row__num holder-col--corporate">${formatPercent(row.corporate)}</td>
  <td class="holder-row__num holder-col--institution">${formatPercent(row.institution)}</td>
  <td class="holder-row__num holder-row__other holder-col--other">${formatPercent(row.other)}</td>
  <td class="holder-row__num holder-row__total holder-col--total">${formatShares(row.totalYi * 1e4)}</td>
</tr>`
}

export function tableEmptyRowHtml(): string {
  return '<tr class="holder-empty" data-holder-empty hidden><td colspan="8">没有匹配的股票。试试代码、简称或板块。</td></tr>'
}

export function normalizeQuery(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, '').trim().toLowerCase()
}

/** Search covers the code, the current name, every printed old name and the board. */
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

const collator = new Intl.Collator('zh-Hans', { numeric: true, sensitivity: 'base' })
const BOARD_ORDER: Record<Board, number> = { 主板A: 0, 科创板: 1, B股: 2 }

/** Ascending comparison of the chosen column; ties are left to `compareForSort`. */
export function compareTableRows(first: TableRow, second: TableRow, key: SortKey): number {
  let result = 0

  switch (key) {
    case 'code':
      result = first.code.localeCompare(second.code)
      break
    case 'name':
      result = collator.compare(first.name, second.name)
      break
    case 'board':
      result = BOARD_ORDER[first.board] - BOARD_ORDER[second.board]
      break
    case 'total':
      result = first.totalYi - second.totalYi
      break
    default:
      result = first[key] - second[key]
  }

  return result
}

/** The sort order: the chosen column changes direction, ties stay in code order. */
export function compareForSort(
  first: TableRow,
  second: TableRow,
  key: SortKey,
  direction: 'asc' | 'desc',
): number {
  const primary = compareTableRows(first, second, key)
  if (primary !== 0) return primary * (direction === 'asc' ? 1 : -1)
  return first.code.localeCompare(second.code)
}

export function sortTableRows(rows: TableRow[], key: SortKey, direction: 'asc' | 'desc'): TableRow[] {
  return [...rows].sort((first, second) => compareForSort(first, second, key, direction))
}

export function companyNameAt(company: ClientCompany, year: number): string {
  if (!company.h?.length) return company.n

  let name = company.h[0][1]
  for (const [changeYear, changed] of company.h) {
    if (changeYear > year) break
    name = changed
  }
  return name
}

export function companyAliases(company: ClientCompany): string[] {
  return [...new Set([company.n, ...(company.h?.map(([, name]) => name) ?? [])])]
}

/** Rebuilds one table year from the browser payload. */
export function clientTableRows(payload: ClientPayload, year: number): TableRow[] {
  const index = payload.years.indexOf(year)
  if (index < 0) return []

  const rows: TableRow[] = []
  for (const company of payload.companies) {
    const row = company.r[index]
    if (!row) continue

    rows.push({
      code: company.c,
      name: companyNameAt(company, year),
      board: company.b,
      aliases: companyAliases(company),
      totalYi: row[0],
      individual: row[1],
      corporate: row[2],
      institution: row[3],
      other: row[4],
    })
  }

  return rows
}

/* ------------------------------------------------------------------ */
/* The accordion chart                                                 */
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
  if (first.year === last.year) return `${name} ${last.year} 年末的股东结构：自然人 ${formatPercent(last.individual)}，一般法人 ${formatPercent(last.corporate)}，专业机构 ${formatPercent(last.institution)}。`
  return `${name} ${first.year} 到 ${last.year} 年末的股东结构折线图：自然人从 ${formatPercent(first.individual)} 变为 ${formatPercent(
    last.individual,
  )}，一般法人从 ${formatPercent(first.corporate)} 变为 ${formatPercent(last.corporate)}，专业机构从 ${formatPercent(
    first.institution,
  )} 变为 ${formatPercent(last.institution)}。`
}
