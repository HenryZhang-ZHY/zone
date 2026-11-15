import {
  BOARDS,
  BOARD_OPTIONS,
  type Board,
  type BoardKey,
  type Company,
  type CompanySeriesRow,
  type MarketSeries,
  type PanelCoverage,
  type PanelModel,
  type PanelRow,
  type YearStats,
} from './types'

/**
 * The model behind the page.
 *
 * Two reading positions are computed for every year and board: the **weighted**
 * share (each stock counts by its total shares, so a giant state bank dominates) and
 * the **median company** (each stock counts once). The gap between the two is the
 * point of the page, so both are always carried together.
 */

const percent = (part: number, whole: number): number => (whole > 0 ? (part / whole) * 100 : 0)

const round = (value: number, digits = 4): number => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/** Linear-interpolation quantile, the same definition the audit scripts use. */
export function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return Number.NaN
  if (sorted.length === 1) return sorted[0]

  const position = (sorted.length - 1) * p
  const base = Math.floor(position)
  const rest = position - base
  const next = sorted[base + 1]

  return next === undefined ? sorted[base] : sorted[base] + rest * (next - sorted[base])
}

const shareOf = (rows: PanelRow[], predicate: (row: PanelRow) => boolean): number =>
  rows.length === 0 ? 0 : (rows.filter(predicate).length / rows.length) * 100

function weighted(rows: PanelRow[], value: (row: PanelRow) => number): number {
  let totalWeight = 0
  let total = 0
  for (const row of rows) {
    totalWeight += row.totalHold10k
    total += value(row) * row.totalHold10k
  }
  return totalWeight > 0 ? total / totalWeight : 0
}

/** Summarises one year for one board (or for the whole market). */
export function summarizeRows(rows: PanelRow[], year: number, edition: number): YearStats {
  const individual = rows.map((row) => row.individualPct).sort((a, b) => a - b)
  const institution = rows.map((row) => row.institutionPct).sort((a, b) => a - b)

  return {
    year,
    edition,
    count: rows.length,
    totalHold10k: rows.reduce((sum, row) => sum + row.totalHold10k, 0),
    weightedIndividual: round(weighted(rows, (row) => row.individualPct)),
    weightedCorporate: round(weighted(rows, (row) => row.corporatePct)),
    weightedInstitution: round(weighted(rows, (row) => row.institutionPct)),
    weightedOther: round(weighted(rows, (row) => row.otherPct)),
    median: round(quantile(individual, 0.5)),
    p25: round(quantile(individual, 0.25)),
    p75: round(quantile(individual, 0.75)),
    over50: round(shareOf(rows, (row) => row.individualPct > 50)),
    over80: round(shareOf(rows, (row) => row.individualPct > 80)),
    under20: round(shareOf(rows, (row) => row.individualPct < 20)),
    institutionMedian: round(quantile(institution, 0.5)),
  }
}

const latest = <T>(items: T[]): T | undefined => items.at(-1)

function buildCompanies(rows: PanelRow[]): Company[] {
  const byCode = new Map<number, PanelRow[]>()
  for (const row of rows) {
    const list = byCode.get(row.code)
    if (list) list.push(row)
    else byCode.set(row.code, [row])
  }

  const companies: Company[] = []
  for (const [code, list] of byCode) {
    const sorted = [...list].sort((a, b) => a.year - b.year)
    const newest = sorted.at(-1)!
    const names: Company['names'] = []
    for (const row of sorted) {
      if (names.at(-1)?.name !== row.name) names.push({ year: row.year, name: row.name })
    }

    companies.push({
      code,
      name: newest.name,
      board: newest.board,
      names,
      rows: sorted.map(
        (row): CompanySeriesRow => ({
          year: row.year,
          totalHold10k: row.totalHold10k,
          individualPct: row.individualPct,
          corporatePct: row.corporatePct,
          institutionPct: row.institutionPct,
          otherPct: row.otherPct,
        }),
      ),
    })
  }

  return companies.sort((a, b) => a.code - b.code)
}

function buildCoverage(rows: PanelRow[], years: number[], companies: Company[]): PanelCoverage {
  const latestYear = years.at(-1)!
  const latestRows = rows.filter((row) => row.year === latestYear)
  const top10 = [...latestRows]
    .sort((a, b) => b.totalHold10k - a.totalHold10k)
    .slice(0, 10)
    .reduce((sum, row) => sum + row.totalHold10k, 0)
  const latestTotal = latestRows.reduce((sum, row) => sum + row.totalHold10k, 0)
  const boardCounts = Object.fromEntries(
    BOARDS.map((board) => [board, latestRows.filter((row) => row.board === board).length]),
  ) as Record<Board, number>

  return {
    rows: rows.length,
    companies: companies.length,
    names: new Set(rows.map((row) => row.name)).size,
    years: years.length,
    firstYear: years[0],
    lastYear: latestYear,
    firstEdition: years[0] + 1,
    lastEdition: latestYear + 1,
    latestCount: latestRows.length,
    boardCounts,
    latestTotalHold10k: latestTotal,
    top10Share: round(percent(top10, latestTotal)),
  }
}

function seriesFor(rows: PanelRow[], years: number[], editions: number[], board: BoardKey): MarketSeries {
  return years.map((year, index) => {
    const matching = rows.filter((row) => row.year === year && (board === 'all' || row.board === board))
    return matching.length > 0 ? summarizeRows(matching, year, editions[index]) : null
  })
}

export function buildPanelModel(rows: PanelRow[]): PanelModel {
  if (rows.length === 0) throw new Error('panel.csv has no rows')

  const years = [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b)
  const editions = years.map((year) => {
    const edition = rows.find((row) => row.year === year)!.edition
    return edition
  })
  const editionsByYear = Object.fromEntries(years.map((year, index) => [year, editions[index]]))
  const companies = buildCompanies(rows)

  const stats = Object.fromEntries(
    BOARD_OPTIONS.map((option) => [option.key, seriesFor(rows, years, editions, option.key)]),
  ) as Record<BoardKey, MarketSeries>

  return {
    rows: [...rows].sort((a, b) => a.year - b.year || a.code - b.code),
    years,
    editionsByYear,
    stats,
    companies,
    latestYear: years.at(-1)!,
    coverage: buildCoverage(rows, years, companies),
  }
}

/** The latest-year row for each code, for the snapshot lists. */
export function latestRowsByCompany(model: PanelModel): Map<number, PanelRow> {
  const map = new Map<number, PanelRow>()
  for (const row of model.rows) {
    if (row.year === model.latestYear) map.set(row.code, row)
  }
  return map
}

/** A year-over-year comparison keeps only the codes both yearbooks list. */
export interface CompanyMove {
  code: number
  name: string
  board: Board
  firstYear: number
  secondYear: number
  first: number
  second: number
  delta: number
}

export function buildMoves(model: PanelModel, fromYear: number, toYear: number): CompanyMove[] {
  const from = new Map<number, PanelRow>()
  for (const row of model.rows) if (row.year === fromYear) from.set(row.code, row)

  const moves: CompanyMove[] = []
  for (const row of model.rows) {
    if (row.year !== toYear) continue
    const previous = from.get(row.code)
    if (!previous) continue
    moves.push({
      code: row.code,
      name: row.name,
      board: row.board,
      firstYear: fromYear,
      secondYear: toYear,
      first: previous.individualPct,
      second: row.individualPct,
      delta: row.individualPct - previous.individualPct,
    })
  }

  return moves
}

/** `latest()` helper exported for the page's snapshot copy. */
export { latest }
