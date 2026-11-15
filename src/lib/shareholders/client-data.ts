import {
  BOARDS,
  COMPACT_STAT_FIELDS,
  type BoardKey,
  type ClientCompany,
  type ClientCompanyRow,
  type ClientPayload,
  type CompactStats,
  type MarketSeries,
  type PanelModel,
  type YearStats,
} from './types'

/**
 * The browser needs two shapes:
 *
 * - `panel.json`: one row per stock per year, fetched only when the reader searches
 *   a stock or follows a deep link. The percentages stay at the printed two decimals;
 *   the share count is collapsed to 亿股.
 * - `CompactStats`: per-year market aggregates inlined in the page HTML, small enough
 *   that the board filter works without a request.
 */

const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function buildClientPayload(model: PanelModel): ClientPayload {
  const companies: ClientCompany[] = model.companies.map((company) => {
    const byYear = new Map(company.rows.map((row) => [row.year, row]))
    const aliases = company.names.map((entry) => entry.name).filter((name) => name !== company.name)

    return {
      c: String(company.code).padStart(6, '0'),
      n: company.name,
      b: company.board,
      ...(aliases.length > 0 ? { a: aliases } : {}),
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

export function buildCompactStats(model: PanelModel): CompactStats {
  const series = Object.fromEntries(
    Object.entries(model.stats).map(([key, years]) => [
      key,
      years.map((stats) =>
        stats
          ? COMPACT_STAT_FIELDS.map((field) => {
              const value = stats[field]
              return typeof value === 'number' ? round(value) : value
            })
          : null,
      ),
    ]),
  ) as CompactStats['series']

  return { years: model.years, series }
}

/** Rebuilds the year objects the chart, table and summaries read. */
export function decodeCompactStats(compact: CompactStats): Record<BoardKey, MarketSeries> {
  const decode = (rows: (number[] | null)[]): MarketSeries =>
    rows.map((row, index) => {
      if (!row) return null
      const stats = Object.fromEntries(
        COMPACT_STAT_FIELDS.map((field, fieldIndex) => [field, row[fieldIndex]]),
      ) as Omit<YearStats, 'year' | 'edition'>
      return { ...stats, year: compact.years[index], edition: compact.years[index] + 1 }
    })

  return Object.fromEntries(
    Object.entries(compact.series).map(([key, rows]) => [key, decode(rows)]),
  ) as Record<BoardKey, MarketSeries>
}
