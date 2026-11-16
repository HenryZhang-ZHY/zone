import {
  BOARDS,
  type Board,
  type Company,
  type CompanySeriesRow,
  type PanelCoverage,
  type PanelModel,
  type PanelRow,
} from './types'

/**
 * The table's build-time model.
 *
 * The page only needs one thing from the panel: a company, its printed names and
 * its yearly rows. The market aggregates that the old report computed are gone;
 * the table reads a row at a time.
 */

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
    latestCount: latestRows.length,
    boardCounts,
  }
}

export function buildPanelModel(rows: PanelRow[]): PanelModel {
  if (rows.length === 0) throw new Error('panel.csv has no rows')

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
