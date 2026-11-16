import { describe, expect, it } from 'vitest'
import type { ClientPayload } from '../types'
import {
  buildHistory,
  clientTableRows,
  companyNameAt,
  compareTableRows,
  firstComparable,
  historyAriaLabel,
  historyLatest,
  historyPath,
  historySummary,
  historyX,
  historyY,
  lastPoint,
  matchesTableRow,
  sortTableRows,
  tableEmptyRowHtml,
  tableRowHtml,
  type History,
  type TableRow,
} from '../table'

const row = (overrides: Partial<TableRow> = {}): TableRow => ({
  code: '600000',
  name: '浦发银行',
  board: '主板A',
  aliases: ['SST湖科', '大晟文化'],
  totalYi: 35.38,
  individual: 3.86,
  corporate: 45.61,
  institution: 50.54,
  other: 0,
  ...overrides,
})

const payload: ClientPayload = {
  years: [2009, 2010, 2011, 2012],
  boards: ['主板A', '科创板', 'B股'],
  companies: [
    {
      c: '600000',
      n: '浦发银行',
      b: '主板A',
      r: [
        [79.26, 23.37, 47.49, 29.14, 0],
        [114.79, 26.21, 48.2, 25.07, 0.52],
        [149.23, 20.85, 50.68, 27.14, 1.33],
        [149.23, 21.4, 47.97, 26.8, 3.83],
      ],
    },
    {
      c: '600892',
      n: '大晟文化',
      b: '主板A',
      h: [
        [2011, 'SST湖科'],
        [2012, '大晟文化'],
      ],
      r: [null, null, [12.3, 55.1, 30.2, 14.7, 0], [12.4, 54.8, 30.5, 14.7, 0]],
    },
  ],
}

describe('search', () => {
  it('matches code, current name, every old name and the board', () => {
    expect(matchesTableRow(row(), '600')).toBe(true)
    expect(matchesTableRow(row(), '浦发')).toBe(true)
    expect(matchesTableRow(row(), 'sst')).toBe(true)
    expect(matchesTableRow(row(), '主板')).toBe(true)
    expect(matchesTableRow(row(), '科创')).toBe(false)
    expect(matchesTableRow(row(), '')).toBe(true)
  })

  it('normalises full-width digits and surrounding space', () => {
    expect(matchesTableRow(row(), ' ６０００００ ')).toBe(true)
    expect(matchesTableRow(row(), '主板 A')).toBe(true)
  })
})

describe('sorting', () => {
  it('sorts numbers both ways and keeps the code as the tie-breaker', () => {
    const rows = [
      row({ code: '600003', individual: 10 }),
      row({ code: '600001', individual: 5 }),
      row({ code: '600002', individual: 20 }),
    ]

    expect(sortTableRows(rows, 'individual', 'desc').map((entry) => entry.individual)).toEqual([20, 10, 5])
    expect(sortTableRows(rows, 'individual', 'asc').map((entry) => entry.individual)).toEqual([5, 10, 20])

    const tied = [row({ code: '600003', individual: 10 }), row({ code: '600001', individual: 10 })]
    expect(sortTableRows(tied, 'individual', 'desc').map((entry) => entry.code)).toEqual(['600001', '600003'])
  })

  it('orders the boards as the yearbook does', () => {
    const rows = [
      row({ code: '900901', board: 'B股' }),
      row({ code: '688001', board: '科创板' }),
      row({ code: '600001', board: '主板A' }),
    ]
    expect(sortTableRows(rows, 'board', 'asc').map((entry) => entry.board)).toEqual(['主板A', '科创板', 'B股'])
  })

  it('compares names and codes', () => {
    const first = row({ code: '600001', name: '安井食品' })
    const second = row({ code: '600002', name: '中国平安' })
    expect(compareTableRows(first, second, 'name')).toBeLessThan(0)
    expect(compareTableRows(first, second, 'code')).toBeLessThan(0)
  })
})

describe('server row markup', () => {
  it('keeps sort keys in data attributes and escapes the printed name', () => {
    const html = tableRowHtml(row({ name: '<script>坏`名称' }))
    expect(html).toContain('data-code="600000"')
    expect(html).toContain('data-individual="3.86"')
    expect(html).toContain('data-aliases="SST湖科|大晟文化"')
    expect(html).toContain('&lt;script&gt;坏`名称')
    expect(html).not.toContain('<script>坏')
    expect(html).toContain('aria-expanded="false"')
    expect(tableEmptyRowHtml()).toContain('data-holder-empty')
  })
})

describe('browser rows', () => {
  it('rebuilds a year and resolves the printed name for that year', () => {
    expect(companyNameAt(payload.companies[1], 2011)).toBe('SST湖科')
    expect(companyNameAt(payload.companies[1], 2012)).toBe('大晟文化')

    const rows2009 = clientTableRows(payload, 2009)
    expect(rows2009.map((entry) => entry.code)).toEqual(['600000'])

    const rows2011 = clientTableRows(payload, 2011)
    expect(rows2011.map((entry) => entry.name)).toEqual(['浦发银行', 'SST湖科'])
    expect(rows2011[0]).toMatchObject({ individual: 20.85, totalYi: 149.23 })
  })
})

describe('history', () => {
  const history: History = [
    { year: 2009, totalYi: 79.26, individual: 23.37, corporate: 47.49, institution: 29.14, other: 0 },
    { year: 2010, totalYi: 114.79, individual: 26.21, corporate: 48.2, institution: 25.07, other: 0.52 },
    null,
    { year: 2012, totalYi: 149.23, individual: 21.4, corporate: 47.97, institution: 26.8, other: 3.83 },
  ]

  it('places slots at the centre of equal year cells', () => {
    expect(historyX(0, 2)).toBe(25)
    expect(historyX(1, 2)).toBe(75)
    expect(historyY(0)).toBe(100)
    expect(historyY(100)).toBe(0)
    expect(historyY(120)).toBe(0)
    expect(historyY(-5)).toBe(100)
  })

  it('breaks the path at missing years', () => {
    const path = historyPath(history, 'individual')
    expect(path.match(/M/g)).toHaveLength(1)
    expect(path).toContain('M12.500,76.630L37.500,73.790')
    expect(path).not.toContain('87.500')

    const longer: History = [...history, { year: 2013, totalYi: 160, individual: 20, corporate: 49, institution: 27, other: 4 }]
    const longerPath = historyPath(longer, 'individual')
    expect(longerPath.match(/M/g)).toHaveLength(2)
    expect(longerPath).toContain('M70.000,78.600L90.000,80.000')
  })

  it('reads the latest point even when a later year is missing', () => {
    expect(historyLatest(history, 'individual')).toEqual({ index: 3, value: 21.4 })
    expect(lastPoint(history)?.year).toBe(2012)
  })

  it('starts the summary at the first comparable year', () => {
    const withEarly: History = [
      { year: 2007, totalYi: 10, individual: 90, corporate: 5, institution: 5, other: 0 },
      ...history,
    ]
    expect(firstComparable(withEarly)?.year).toBe(2009)
    expect(historySummary(withEarly)).toContain('2009–2012 年末')
    expect(historySummary(withEarly)).toContain('自然人 −2.0pp')
  })

  it('labels the chart with the first and last readable values', () => {
    const label = historyAriaLabel('浦发银行', history)
    expect(label).toContain('2009 到 2012 年末')
    expect(label).toContain('自然人从 23.4% 变为 21.4%')
  })

  it('builds the year series from the payload', () => {
    const built = buildHistory(payload.companies[1], payload.years)
    expect(built[0]).toBeNull()
    expect(built[0]).toBeNull()
    expect(built[2]).toMatchObject({ year: 2011, individual: 55.1 })
  })
})
