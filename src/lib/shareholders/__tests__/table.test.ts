import { describe, expect, it } from 'vitest'
import type { ClientPayload } from '../types'
import type { SzseClientPayload } from '../szse'
import {
  SSE_COLUMNS,
  SZSE_COLUMNS,
  buildHistory,
  buildSzseHistory,
  columnsForMarket,
  companyNameAt,
  compareForSort,
  historyAriaLabel,
  historyPath,
  historySummary,
  historyX,
  historyY,
  matchesTableRow,
  sortTableRows,
  sseTableRows,
  szseHistorySummary,
  szseTableRows,
  tableHeadHtml,
  tableRowHtml,
  type History,
  type HistoryPoint,
  type TableRow,
} from '../table'

const sseRow = (overrides: Partial<TableRow> = {}): TableRow => ({
  code: '600000',
  name: '浦发银行',
  board: '主板A',
  aliases: ['SST湖科', '大晟文化'],
  cells: {
    individual: '3.9%',
    corporate: '45.6%',
    institution: '50.5%',
    other: '0.0%',
    total: '35.38 亿股',
  },
  sort: { individual: 3.86, corporate: 45.61, institution: 50.54, other: 0, total: 35.38 },
  ...overrides,
})

const szseRow = (overrides: Partial<TableRow> = {}): TableRow => ({
  code: '000001',
  name: '平安银行',
  board: '主板',
  aliases: ['深发展A', '平安银行'],
  cells: {
    holders: '455,168',
    avg: '42,634',
    small: '3.9%',
    mid: '9.3%',
    large: '86.8%',
    negotiable: '194.1 亿股',
  },
  sort: { holders: 455168, avg: 42634, small: 3.906, mid: 9.339, large: 86.76, negotiable: 194.06 },
  ...overrides,
})

describe('market columns', () => {
  it('keeps the two yearbooks on separate column sets', () => {
    expect(SSE_COLUMNS.map((column) => column.key)).toEqual([
      'code',
      'name',
      'board',
      'individual',
      'corporate',
      'institution',
      'other',
      'total',
    ])
    expect(SZSE_COLUMNS.map((column) => column.key)).toEqual([
      'code',
      'name',
      'board',
      'holders',
      'avg',
      'small',
      'mid',
      'large',
      'negotiable',
    ])
    expect(columnsForMarket('sse')).toBe(SSE_COLUMNS)
    expect(columnsForMarket('szse')).toBe(SZSE_COLUMNS)
  })
})

describe('markup', () => {
  it('renders sortable headers and a static fallback header', () => {
    const html = tableHeadHtml(SSE_COLUMNS, 'individual', 'desc')
    expect(html).toContain('data-sort="individual"')
    expect(html).toContain('aria-sort="descending"')
    expect(html).toContain('data-sort-mark')
    expect(html).toContain('↓')

    const staticHtml = tableHeadHtml(SSE_COLUMNS, 'code', 'asc', false)
    expect(staticHtml).toContain('holder-th__static')
    expect(staticHtml).not.toContain('data-sort=')
  })

  it('keeps sort values in the row and escapes printed names', () => {
    const html = tableRowHtml(sseRow({ name: '<script>坏`名称' }), SSE_COLUMNS)
    expect(html).toContain('data-code="600000"')
    expect(html).toContain('data-sort=')
    expect(html).toContain('&quot;individual&quot;')
    expect(html).toContain('&lt;script&gt;坏`名称')
    expect(html).not.toContain('<script>坏')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('holder-col--individual')
  })

  it('marks the open row and links it to the detail row', () => {
    const html = tableRowHtml(sseRow(), SSE_COLUMNS, true, true, 'holder-detail-600000')
    expect(html).toContain('holder-row is-open')
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('aria-controls="holder-detail-600000"')
  })
})

describe('search and sort', () => {
  it('matches code, current name, old names, board and ignores spaces', () => {
    expect(matchesTableRow(sseRow(), '600')).toBe(true)
    expect(matchesTableRow(sseRow(), '浦发')).toBe(true)
    expect(matchesTableRow(sseRow(), 'sst')).toBe(true)
    expect(matchesTableRow(sseRow(), '主板 A')).toBe(true)
    expect(matchesTableRow(sseRow(), ' ６０００００ ')).toBe(true)
    expect(matchesTableRow(sseRow(), '科创')).toBe(false)
  })

  it('sorts the chosen column and keeps code order for ties', () => {
    const rows = [
      sseRow({ code: '600003', sort: { ...sseRow().sort, individual: 10 } }),
      sseRow({ code: '600001', sort: { ...sseRow().sort, individual: 5 } }),
      sseRow({ code: '600002', sort: { ...sseRow().sort, individual: 20 } }),
    ]

    expect(sortTableRows(rows, 'individual', 'desc').map((row) => row.sort.individual)).toEqual([20, 10, 5])
    expect(sortTableRows(rows, 'individual', 'asc').map((row) => row.sort.individual)).toEqual([5, 10, 20])

    const tied = [
      sseRow({ code: '600003', sort: { ...sseRow().sort, individual: 10 } }),
      sseRow({ code: '600001', sort: { ...sseRow().sort, individual: 10 } }),
    ]
    expect(sortTableRows(tied, 'individual', 'desc').map((row) => row.code)).toEqual(['600001', '600003'])
    expect(compareForSort(tied[0], tied[1], 'individual', 'asc')).toBeGreaterThan(0)
  })

  it('orders boards by the yearbook order', () => {
    const rows = [
      szseRow({ code: '300001', board: '创业板' }),
      szseRow({ code: '000001', board: '主板' }),
    ]
    expect(sortTableRows(rows, 'board', 'asc').map((row) => row.board)).toEqual(['主板', '创业板'])
  })
})

describe('browser row builders', () => {
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

  const szsePayload: SzseClientPayload = {
    years: [2008, 2025],
    boards: ['主板', '创业板'],
    companies: [
      {
        c: '000001',
        n: '平安银行',
        b: '主板',
        h: [
          [2008, '深发展A'],
          [2012, '平安银行'],
        ],
        r: [
          [27.82, 294889, 9433, 2.131, 7.921, 4.467, 9.974, 3.437, 72.07],
          [194.06, 455168, 42634, 0.297, 1.84, 1.766, 6.421, 2.918, 86.76],
        ],
      },
    ],
  }

  it('rebuilds SSE rows with the name printed in that year', () => {
    expect(companyNameAt(payload.companies[1], 2011)).toBe('SST湖科')
    expect(companyNameAt(payload.companies[1], 2012)).toBe('大晟文化')
    expect(sseTableRows(payload, 2009).map((row) => row.code)).toEqual(['600000'])
    expect(sseTableRows(payload, 2011).map((row) => row.name)).toEqual(['浦发银行', 'SST湖科'])
    expect(sseTableRows(payload, 2011)[0].cells.individual).toBe('20.9%')
  })

  it('rebuilds SZSE rows and derives the three groups', () => {
    expect(szseTableRows(szsePayload, 2008).map((row) => row.name)).toEqual(['深发展A'])
    const rows = szseTableRows(szsePayload, 2025)
    expect(rows[0].cells.holders).toBe('455,168')
    expect(rows[0].cells.avg).toBe('42,634')
    expect(rows[0].cells.small).toBe('3.9%')
    expect(rows[0].cells.mid).toBe('9.3%')
    expect(rows[0].cells.large).toBe('86.8%')
    expect(rows[0].sort.holders).toBe(455168)
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

  it('breaks the line at missing years', () => {
    const path = historyPath(history, 'individual')
    expect(path.match(/M/g)).toHaveLength(1)
    expect(path).toContain('M12.500,76.630L37.500,73.790')
    expect(path).not.toContain('87.500')

    const longer: History = [
      ...history,
      { year: 2013, totalYi: 160, individual: 20, corporate: 49, institution: 27, other: 4 },
    ]
    const longerPath = historyPath(longer, 'individual')
    expect(longerPath.match(/M/g)).toHaveLength(2)
    expect(longerPath).toContain('M70.000,78.600L90.000,80.000')
  })

  it('summarises SSE and SZSE histories', () => {
    expect(historySummary(history)).toContain('2009–2012 年末')
    expect(historySummary(history)).toContain('自然人 −2.0pp')
    expect(historyAriaLabel('浦发银行', history)).toContain('2009 到 2012 年末')

    const szse = buildSzseHistory(
      {
        c: '000001',
        n: '平安银行',
        b: '主板',
        r: [
          [27.82, 294889, 9433, 2.131, 7.921, 4.467, 9.974, 3.437, 72.07],
          [194.06, 455168, 42634, 0.297, 1.84, 1.766, 6.421, 2.918, 86.76],
        ],
      },
      [2008, 2025],
    )
    expect(szseHistorySummary(szse)).toContain('455,168 户股东')
    expect(szseHistorySummary(szse)).toContain('+14.7pp')
  })

  it('builds the SSE series with missing years kept as null', () => {
    const built = buildHistory(
      {
        c: '600000',
        n: '浦发银行',
        b: '主板A',
        r: [[1, 2, 3, 4, 5], null],
      },
      [2023, 2024],
    )
    expect(built[0]).toMatchObject({ year: 2023, individual: 2 })
    expect(built[1]).toBeNull()
  })
})
