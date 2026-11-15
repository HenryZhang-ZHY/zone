/**
 * The shareholder panel.
 *
 * The data is the "年末个股股东持股情况 / Distribution of Shareholders" table of the
 * Shanghai Stock Exchange Statistical Yearbook, 2008–2025 volumes: one row per stock
 * per year-end, split into 自然人 / 一般法人 / 专业机构 plus the printed residual.
 *
 * These types are shared by the build-time reader, the JSON endpoint and the browser.
 * Nothing here touches `node:fs`; the reader lives in `parse.ts`.
 */

export type Board = '主板A' | '科创板' | 'B股'

export const BOARDS: readonly Board[] = ['主板A', '科创板', 'B股']

export type BoardKey = 'all' | Board

export interface BoardOption {
  key: BoardKey
  label: string
}

/** The board filter, in reading order: the whole market first, then each board. */
export const BOARD_OPTIONS: readonly BoardOption[] = [
  { key: 'all', label: '全部' },
  { key: '主板A', label: '主板A' },
  { key: '科创板', label: '科创板' },
  { key: 'B股', label: 'B股' },
]

/** Where the downloadable raw file lives. Kept here so every link agrees. */
export const PANEL_CSV_URL = '/data/sse-shareholders/panel.csv'
export const PANEL_CSV_FILENAME = 'sse-shareholders-panel.csv'
export const PANEL_JSON_URL = '/data/sse-shareholders/panel.json'

export type NameSource = 'native' | 'decoded' | 'neighbor'

/** One row of `panel.csv`, with the printed columns typed. Units stay 万股. */
export interface PanelRow {
  /** Yearbook volume; `edition = year + 1`. */
  edition: number
  /** Year-end the row describes. */
  year: number
  /** Six-digit stock code. */
  code: number
  name: string
  nameSource: NameSource
  board: Board
  totalHold10k: number
  individualHold10k: number
  individualPct: number
  corporateHold10k: number
  corporatePct: number
  institutionHold10k: number
  institutionPct: number
  otherHold10k: number
  otherPct: number
}

/** One year, one board (or the whole market): the numbers the panel is read in. */
export interface YearStats {
  year: number
  edition: number
  count: number
  totalHold10k: number
  /** Share of the year's total shares, weighted by each stock's total. */
  weightedIndividual: number
  weightedCorporate: number
  weightedInstitution: number
  weightedOther: number
  /** Of the companies, not of the shares. */
  median: number
  p25: number
  p75: number
  over50: number
  over80: number
  under20: number
  institutionMedian: number
}

/** The series a chart and the annual table need; a missing year is `null`. */
export type MarketSeries = (YearStats | null)[]

export interface CompanySeriesRow {
  year: number
  totalHold10k: number
  individualPct: number
  corporatePct: number
  institutionPct: number
  otherPct: number
}

export interface Company {
  code: number
  /** Latest printed name; the row's `names` keeps the history. */
  name: string
  board: Board
  names: { year: number; name: string }[]
  rows: CompanySeriesRow[]
}

export interface PanelCoverage {
  rows: number
  companies: number
  names: number
  years: number
  firstYear: number
  lastYear: number
  firstEdition: number
  lastEdition: number
  /** Stocks in the latest year. */
  latestCount: number
  boardCounts: Record<Board, number>
  /** Sum of `total_hold_10k` in the latest year, in 万股. */
  latestTotalHold10k: number
  /** Share of the latest year's total held by its ten largest stocks, in percent. */
  top10Share: number
}

export interface PanelModel {
  rows: PanelRow[]
  years: number[]
  editionsByYear: Record<number, number>
  stats: Record<BoardKey, MarketSeries>
  companies: Company[]
  latestYear: number
  coverage: PanelCoverage
}

/**
 * The browser payload. The market series travel inline with the page; the company
 * rows live in `panel.json` and are fetched on first use.
 */
export type ClientCompanyRow = [
  totalYi: number,
  individualPct: number,
  corporatePct: number,
  institutionPct: number,
  otherPct: number,
]

export interface ClientCompany {
  /** Six-digit code as printed, leading zeros kept. */
  c: string
  /** Latest name. */
  n: string
  b: Board
  /** Earlier names, when the stock was renamed. */
  a?: string[]
  /** One entry per `years` index; `null` when the stock is not in that yearbook. */
  r: (ClientCompanyRow | null)[]
}

export interface ClientPayload {
  years: number[]
  boards: Board[]
  companies: ClientCompany[]
}

/** Compact per-year numbers inlined in the page for the market chart and table. */
export const COMPACT_STAT_FIELDS = [
  'count',
  'weightedIndividual',
  'weightedCorporate',
  'weightedInstitution',
  'median',
  'p25',
  'p75',
  'over50',
  'over80',
  'under20',
] as const

export interface CompactStats {
  years: number[]
  series: Record<BoardKey, (number[] | null)[]>
}
