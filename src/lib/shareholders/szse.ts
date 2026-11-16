/**
 * The Shenzhen Stock Exchange's side of the table.
 *
 * Its yearbook prints one row per stock per year-end, but it splits holders by
 * **holding size** rather than investor identity: six buckets from under 1,000
 * shares to 100,000 and above, plus the total holder count and the tradable
 * (托管流通) shares. It cannot be compared with the SSE identity split; the page
 * switches between the two datasets rather than mixing their columns.
 */

export type SzseBoard = '主板' | '创业板'

export const SZSE_BOARDS: readonly SzseBoard[] = ['主板', '创业板']

export const SZSE_CSV_URL = '/data/szse-shareholders/panel.csv'
export const SZSE_CSV_FILENAME = 'szse-shareholders-panel.csv'
export const SZSE_JSON_URL = '/data/szse-shareholders/panel.json'

export interface SzsePanelRow {
  /** The yearbook volume is also the data year (2025 volume = 2025 year-end). */
  year: number
  code: number
  name: string
  board: SzseBoard
  /** 托管流通股数，万股. */
  negotiable10k: number
  holdersTotal: number
  /** Six printed buckets, shares under 1k / 1k–5k / 5k–10k / 10k–50k / 50k–100k / 100k+. */
  holderCounts: [number, number, number, number, number, number]
  /** The same six buckets as printed percentages; they add to 100. */
  percentages: [number, number, number, number, number, number]
  /** 户均持股（股）. */
  avgHoldShares: number
}

export interface SzseCompanyRow {
  year: number
  negotiable10k: number
  holdersTotal: number
  avgHoldShares: number
  percentages: [number, number, number, number, number, number]
}

export interface SzseCompany {
  code: number
  name: string
  board: SzseBoard
  names: { year: number; name: string }[]
  rows: SzseCompanyRow[]
}

export interface SzseCoverage {
  rows: number
  companies: number
  names: number
  years: number
  firstYear: number
  lastYear: number
  latestCount: number
  boardCounts: Record<SzseBoard, number>
}

export interface SzseModel {
  rows: SzsePanelRow[]
  years: number[]
  companies: SzseCompany[]
  latestYear: number
  coverage: SzseCoverage
}

/** One browser row: `[negotiableYi, holders, avgHold, p<1k, p1k5k, p5k10k, p10k50k, p50k100k, p>100k]`. */
export type SzseClientRow = [
  negotiableYi: number,
  holders: number,
  avgHold: number,
  pLt1k: number,
  p1k5k: number,
  p5k10k: number,
  p10k50k: number,
  p50k100k: number,
  pGt100k: number,
]

export interface SzseClientCompany {
  c: string
  n: string
  b: SzseBoard
  h?: [number, string][]
  r: (SzseClientRow | null)[]
}

export interface SzseClientPayload {
  years: number[]
  boards: SzseBoard[]
  companies: SzseClientCompany[]
}

const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function buildCompanies(rows: SzsePanelRow[]): SzseCompany[] {
  const byCode = new Map<number, SzsePanelRow[]>()
  for (const row of rows) {
    const list = byCode.get(row.code)
    if (list) list.push(row)
    else byCode.set(row.code, [row])
  }

  const companies: SzseCompany[] = []
  for (const [code, list] of byCode) {
    const sorted = [...list].sort((a, b) => a.year - b.year)
    const newest = sorted.at(-1)!
    const names: SzseCompany['names'] = []
    for (const row of sorted) {
      if (names.at(-1)?.name !== row.name) names.push({ year: row.year, name: row.name })
    }

    companies.push({
      code,
      name: newest.name,
      board: newest.board,
      names,
      rows: sorted.map((row) => ({
        year: row.year,
        negotiable10k: row.negotiable10k,
        holdersTotal: row.holdersTotal,
        avgHoldShares: row.avgHoldShares,
        percentages: row.percentages,
      })),
    })
  }

  return companies.sort((a, b) => a.code - b.code)
}

function buildCoverage(rows: SzsePanelRow[], years: number[], companies: SzseCompany[]): SzseCoverage {
  const latestYear = years.at(-1)!
  const latestRows = rows.filter((row) => row.year === latestYear)
  const boardCounts = Object.fromEntries(
    SZSE_BOARDS.map((board) => [board, latestRows.filter((row) => row.board === board).length]),
  ) as Record<SzseBoard, number>

  return {
    rows: rows.length,
    companies: companies.length,
    names: new Set(rows.map((row) => row.name)).size,
    years: years.length,
    firstYear: years[0],
    lastYear: latestYear,
    latestCount: latestRows.length,
    boardCounts,
  }
}

export function buildSzseModel(rows: SzsePanelRow[]): SzseModel {
  if (rows.length === 0) throw new Error('szse panel.csv has no rows')

  const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b)
  const companies = buildCompanies(rows)

  return {
    rows: [...rows].sort((a, b) => a.year - b.year || a.code - b.code),
    years,
    companies,
    latestYear: years.at(-1)!,
    coverage: buildCoverage(rows, years, companies),
  }
}

export function buildSzseClientPayload(model: SzseModel): SzseClientPayload {
  const companies: SzseClientCompany[] = model.companies.map((company) => {
    const byYear = new Map(company.rows.map((row) => [row.year, row]))
    const changes: [number, string][] | undefined =
      company.names.length > 1 ? company.names.map(({ year, name }) => [year, name]) : undefined

    return {
      c: String(company.code).padStart(6, '0'),
      n: company.name,
      b: company.board,
      ...(changes ? { h: changes } : {}),
      r: model.years.map((year): SzseClientRow | null => {
        const row = byYear.get(year)
        if (!row) return null
        return [
          round(row.negotiable10k / 1e4),
          row.holdersTotal,
          row.avgHoldShares,
          ...row.percentages,
        ]
      }),
    }
  })

  return { years: model.years, boards: [...SZSE_BOARDS], companies }
}
