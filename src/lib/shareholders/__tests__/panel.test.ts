import { describe, expect, it } from 'vitest'
import { buildClientPayload, buildCompactStats, decodeCompactStats } from '../client-data'
import { buildMoves, buildPanelModel, latestRowsByCompany, quantile } from '../model'
import { loadPanelRows, parsePanelCsv } from '../parse'
import { BOARDS } from '../types'

const rows = loadPanelRows()
const model = buildPanelModel(rows)

describe('panel.csv', () => {
  it('keeps the vendored file exactly as surfer published it', () => {
    expect(rows).toHaveLength(24584)
    expect(rows[0]).toMatchObject({
      edition: 2008,
      year: 2007,
      code: 600000,
      name: '浦发银行',
      board: '主板A',
      totalHold10k: 353822.76,
      individualPct: 3.86,
    })
    expect(model.years).toHaveLength(18)
    expect(model.years[0]).toBe(2007)
    expect(model.years.at(-1)).toBe(2024)
    expect(model.editionsByYear[2024]).toBe(2025)
  })

  it('rejects a file that is not the 15-column export', () => {
    expect(() => parsePanelCsv('a,b\n1,2')).toThrow(/header/)
    const header = 'edition,data_year,sec_code,sec_name,name_source,board,total_hold_10k,individual_hold_10k,individual_pct,corporate_hold_10k,corporate_pct,institution_hold_10k,institution_pct,other_hold_10k,other_pct'
    expect(() => parsePanelCsv(`${header}\n2008,2007,600000,浦发银行,native,主板A,1,2`)).toThrow(/columns/)
    expect(() => parsePanelCsv(`${header}\n2008,2007,600000,浦发银行,native,三板,1,1,1,1,1,1,1,1,1`)).toThrow(/board/)
  })

  it('has percentages and holdings that add up row by row', () => {
    let worstPercentage = 0
    let worstHoldings = 0
    for (const row of rows) {
      worstPercentage = Math.max(
        worstPercentage,
        Math.abs(row.individualPct + row.corporatePct + row.institutionPct + row.otherPct - 100),
      )
      worstHoldings = Math.max(
        worstHoldings,
        Math.abs(
          (row.individualHold10k + row.corporateHold10k + row.institutionHold10k + row.otherHold10k) /
            row.totalHold10k -
            1,
        ),
      )
    }
    expect(worstPercentage).toBeLessThan(0.06)
    expect(worstHoldings).toBeLessThan(1e-9)
  })
})

describe('quantile', () => {
  it('interpolates linearly, matching the audit scripts', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5)
    expect(quantile([1, 2, 3, 4], 0.25)).toBe(1.75)
    expect(quantile([5], 0.5)).toBe(5)
  })
})

describe('model', () => {
  it('reads the latest year two ways: shares and companies', () => {
    const latest = model.stats.all.at(-1)!
    expect(latest).toMatchObject({ year: 2024, edition: 2025, count: 2317 })
    expect(latest.weightedIndividual).toBeCloseTo(21.7399, 3)
    expect(latest.weightedCorporate).toBeCloseTo(63.7924, 3)
    expect(latest.weightedInstitution).toBeCloseTo(14.4672, 3)
    expect(latest.median).toBeCloseTo(45.14, 2)
    expect(latest.p25).toBeCloseTo(26.62, 2)
    expect(latest.p75).toBeCloseTo(67.93, 2)
    expect(latest.over50).toBeCloseTo(43.5477, 2)
  })

  it('carries the 2009 comparison point the page starts from', () => {
    const firstComparable = model.stats.all.find((stats) => stats?.year === 2009)!
    expect(firstComparable).toMatchObject({ count: 860, median: 56.7 })
    expect(firstComparable.weightedIndividual).toBeCloseTo(23.8914, 3)
  })

  it('keeps each board on its own series', () => {
    const star = model.stats['科创板'].filter((stats) => stats !== null)
    expect(star).toHaveLength(6) // 2019–2024 data years, one per yearbook
    expect(star[0]?.year).toBe(2019)
    expect(model.stats['科创板'].at(-1)?.count).toBe(581)
    expect(model.stats['主板A'].at(-1)?.count).toBe(1693)
    expect(model.stats['B股'].at(-1)).toMatchObject({ year: 2024, count: 43, median: 87.4 })
    expect(model.stats['B股'].filter((stats) => stats !== null).map((stats) => stats!.year)).toEqual([
      2013, 2022, 2023, 2024,
    ])
    expect(BOARDS).toEqual(['主板A', '科创板', 'B股'])
  })

  it('summarises coverage from the rows, not from copy', () => {
    expect(model.coverage).toMatchObject({
      rows: 24584,
      companies: 2422,
      names: 3474,
      years: 18,
      firstYear: 2007,
      lastYear: 2024,
      latestCount: 2317,
    })
    expect(model.coverage.boardCounts).toEqual({ 主板A: 1693, 科创板: 581, B股: 43 })
    expect(model.coverage.top10Share).toBeCloseTo(27.5038, 2)
  })

  it('builds one company per code, newest name and printed series', () => {
    expect(model.companies).toHaveLength(2422)

    const pudong = model.companies.find((company) => company.code === 600000)!
    expect(pudong.name).toBe('浦发银行')
    expect(pudong.rows).toHaveLength(18)
    expect(pudong.rows.at(-1)).toMatchObject({ year: 2024, individualPct: 6.39 })

    const smic = model.companies.find((company) => company.code === 688981)!
    expect(smic.board).toBe('科创板')
    expect(smic.rows.map((row) => row.year)).toEqual([2020, 2021, 2022, 2023, 2024])

    const renamed = model.companies.find((company) => company.code === 600892)!
    expect(renamed.name).toBe('大晟文化')
    expect(renamed.names.length).toBe(10)
    expect(renamed.names[0]).toEqual({ year: 2007, name: 'SST湖科' })

    const gone = model.companies.find((company) => company.code === 600145)!
    expect(gone.rows).toHaveLength(14)
  })

  it('lists the latest year once per code and compares only shared codes', () => {
    const latest = latestRowsByCompany(model)
    expect(latest.size).toBe(2317)
    expect(latest.get(601398)?.name).toBe('工商银行')

    const moves = buildMoves(model, 2023, 2024)
    expect(moves).toHaveLength(2285)
    const biggest = [...moves].sort((a, b) => b.delta - a.delta)[0]
    expect(biggest.code).toBe(688066)
    expect(biggest.delta).toBeCloseTo(35.25, 2)
    const icbc = moves.find((move) => move.code === 601398)!
    expect(icbc.delta).toBeCloseTo(2.16 - 2.77, 2)
  })

  it('pins the caliber break the docs warn about', () => {
    expect(rows.find((row) => row.code === 601398 && row.year === 2008)?.totalHold10k).toBe(1495000)
    expect(rows.find((row) => row.code === 601398 && row.year === 2009)?.totalHold10k).toBe(25096234.81)
  })
})

describe('browser payload', () => {
  it('keeps one padded code per company and one slot per year', () => {
    const payload = buildClientPayload(model)
    expect(payload.years).toHaveLength(18)
    expect(payload.companies).toHaveLength(2422)
    expect(payload.companies[0].c).toBe('600000')
    expect(payload.companies.every((company) => company.c.length === 6)).toBe(true)

    const renamed = payload.companies.find((company) => company.c === '600892')!
    expect(renamed.a).toContain('ST宝诚')
    expect(renamed.r).toHaveLength(18)
    const renamedSource = model.companies.find((company) => company.code === 600892)!.rows[0]
    expect(renamed.r[0]?.[1]).toBe(renamedSource.individualPct)

    const smic = payload.companies.find((company) => company.c === '688981')!
    expect(smic.r.slice(0, 13).every((row) => row === null)).toBe(true)
    expect(smic.r[13]?.[1]).toBeCloseTo(45.58, 2)
  })

  it('inlines a compact market series that decodes back to the model', () => {
    const compact = buildCompactStats(model)
    expect(JSON.stringify(compact).length).toBeLessThan(10_000)

    const decoded = decodeCompactStats(compact)
    const latest = decoded.all.at(-1)!
    expect(latest.count).toBe(2317)
    expect(latest.median).toBeCloseTo(45.14, 2)
    expect(latest.edition).toBe(2025)
    expect(decoded['B股'][0]).toBeNull()
  })
})
