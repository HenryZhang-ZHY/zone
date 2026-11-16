import {
  BOARDS,
  type ClientCompany,
  type ClientCompanyRow,
  type ClientPayload,
  type PanelModel,
} from './types'

/**
 * The browser payload: one company with one compact row per year.
 *
 * The latest year is already server-rendered, so this file only carries what the
 * year switch and the accordion need. Percentages stay at the printed two decimals;
 * the share count is collapsed to 亿股, and old names become a short change list.
 */

const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function buildClientPayload(model: PanelModel): ClientPayload {
  const companies: ClientCompany[] = model.companies.map((company) => {
    const byYear = new Map(company.rows.map((row) => [row.year, row]))
    const changes: [number, string][] | undefined =
      company.names.length > 1 ? company.names.map(({ year, name }) => [year, name]) : undefined

    return {
      c: String(company.code).padStart(6, '0'),
      n: company.name,
      b: company.board,
      ...(changes ? { h: changes } : {}),
      r: model.years.map((year): ClientCompanyRow | null => {
        const row = byYear.get(year)
        if (!row) return null
        return [
          round(row.totalHold10k / 1e4),
          row.individualPct,
          row.corporatePct,
          row.institutionPct,
          row.otherPct,
        ]
      }),
    }
  })

  return { years: model.years, boards: [...BOARDS], companies }
}
