import { describe, expect, it } from 'vitest'
import { buildClientPayload } from '../client-data'
import { buildPanelModel } from '../model'
import { loadPanelRows, parsePanelCsv } from '../parse'

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
  })

  it('rejects a file that is not the 15-column export', () => {
    expect(() => parsePanelCsv('a,b\n1,2')).toThrow(/header/)
    const header =
      'edition,data_year,sec_code,sec_name,name_source,board,total_hold_10k,individual_hold_10k,individual_pct,corporate_hold_10k,corporate_pct,institution_hold_10k,institution_pct,other_hold_10k,other_pct'
    expect(() => parsePanelCsv(`${header}\n2008,2007,600000,浦发银行,native,主板A,1,2`)).toThrow(/columns/)
    expect(() =>
      parsePanelCsv(`${header}\n2008,2007,600000,浦发银行,native,三板,1,1,1,1,1,1,1,1,1`),
    ).toThrow(/board/)
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

describe('model', () => {
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
  })

  it('builds one company per code, newest name and printed series', () => {
    expect(model.companies).toHaveLength(2422)

    const pudong = model.companies.find((company) => company.code === 600000)!
    expect(pudong.name).toBe('浦发银行')
    expect(pudong.names).toEqual([{ year: 2007, name: '浦发银行' }])
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
})

describe('browser payload', () => {
  it('keeps one padded code per company and one slot per year', () => {
    const payload = buildClientPayload(model)
    expect(payload.years).toHaveLength(18)
    expect(payload.companies).toHaveLength(2422)
    expect(payload.companies[0].c).toBe('600000')
    expect(payload.companies.every((company) => company.c.length === 6)).toBe(true)

    const renamed = payload.companies.find((company) => company.c === '600892')!
    expect(renamed.h?.[0]).toEqual([2007, 'SST湖科'])
    expect(renamed.h?.at(-1)?.[1]).toBe('大晟文化')
    expect(renamed.r).toHaveLength(18)

    const smic = payload.companies.find((company) => company.c === '688981')!
    expect(smic.r.slice(0, 13).every((row) => row === null)).toBe(true)
    expect(smic.r[13]?.[1]).toBeCloseTo(45.58, 2)
  })

  it('keeps the latest year complete for the server-rendered table', () => {
    const payload = buildClientPayload(model)
    const latestIndex = payload.years.indexOf(2024)
    const latestRows = payload.companies.filter((company) => company.r[latestIndex] !== null)
    expect(latestRows).toHaveLength(2317)
    expect(latestRows.find((company) => company.c === '601398')?.n).toBe('工商银行')
  })
})
