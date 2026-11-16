/**
 * The shareholder table.
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
  /** Latest printed name; `names` keeps the history. */
  name: string
  board: Board
  /** One entry per printed name change, oldest first. */
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
  /** Stocks in the latest year. */
  latestCount: number
  boardCounts: Record<Board, number>
}

export interface PanelModel {
  rows: PanelRow[]
  years: number[]
  companies: Company[]
  latestYear: number
  coverage: PanelCoverage
}

/**
 * The browser payload. The table's latest year is already in the HTML; the full
 * company history lives in `panel.json` and is fetched on idle or first use.
 *
 * One row per year is `[totalYi, individualPct, corporatePct, institutionPct, otherPct]`.
 * `null` means the stock is not in that year's table.
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
  /** Name changes, oldest first: `[year, printed name]`. Absent when never renamed. */
  h?: [number, string][]
  /** One entry per `years` index; `null` when the stock is not in that yearbook. */
  r: (ClientCompanyRow | null)[]
}

export interface ClientPayload {
  years: number[]
  boards: Board[]
  companies: ClientCompany[]
}
