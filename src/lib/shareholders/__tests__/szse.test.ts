import { describe, expect, it } from 'vitest'
import {
  SZSE_BOARDS,
  buildSzseClientPayload,
  buildSzseModel,
} from '../szse'
import { loadSzseRows, parseSzseCsv } from '../szse-parse'

const rows = loadSzseRows()
const model = buildSzseModel(rows)

describe('szse panel.csv', () => {
  it('keeps the vendored Shenzhen panel as surfer published it', () => {
    expect(rows).toHaveLength(34933)
    expect(rows[0]).toMatchObject({
      year: 2008,
      code: 1,
      name: '深发展A',
      board: '主板',
      negotiable10k: 278169.4,
      holdersTotal: 294889,
      avgHoldShares: 9433,
    })
    expect(rows[0].percentages).toEqual([2.131, 7.921, 4.467, 9.974, 3.437, 72.07])
    expect(model.years).toHaveLength(18)
    expect(model.years[0]).toBe(2008)
    expect(model.years.at(-1)).toBe(2025)
    expect(SZSE_BOARDS).toEqual(['主板', '创业板'])
  })

  it('rejects a shifted header and an unknown board', () => {
    expect(() => parseSzseCsv('a,b\n1,2')).toThrow(/header/)
    const header =
      'year,sec_code,sec_name,board,negotiable_10k,holders_total,h_lt1k,p_lt1k,h_1k_5k,p_1k_5k,h_5k_10k,p_5k_10k,h_10k_50k,p_10k_50k,h_50k_100k,p_50k_100k,h_gt100k,p_gt100k,avg_hold_shares'
    expect(() => parseSzseCsv(`${header}\n2008,000001,深发展A,主板,1,1`)).toThrow(/columns/)
    expect(() => parseSzseCsv(`${header}\n2008,000001,深发展A,三板,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1`)).toThrow(
      /board/,
    )
  })

  it('has six buckets that add to 100% and to the holder total', () => {
    let worstPercentage = 0
    let worstHolders = 0
    for (const row of rows) {
      worstPercentage = Math.max(worstPercentage, Math.abs(row.percentages.reduce((a, b) => a + b, 0) - 100))
      worstHolders = Math.max(
        worstHolders,
        Math.abs(row.holderCounts.reduce((a, b) => a + b, 0) - row.holdersTotal),
      )
    }
    expect(worstPercentage).toBeLessThan(0.31)
    expect(worstHolders).toBeLessThan(1)
  })
})

describe('szse model', () => {
  it('summarises coverage and the latest year', () => {
    expect(model.coverage).toMatchObject({
      rows: 34933,
      companies: 3033,
      years: 18,
      firstYear: 2008,
      lastYear: 2025,
      latestCount: 2883,
    })
    expect(model.coverage.boardCounts).toEqual({ 主板: 1490, 创业板: 1393 })
  })

  it('builds one company per code with printed name changes', () => {
    expect(model.companies).toHaveLength(3033)
    const pingan = model.companies.find((company) => company.code === 1)!
    expect(pingan.name).toBe('平安银行')
    expect(pingan.names).toEqual([
      { year: 2008, name: '深发展A' },
      { year: 2012, name: '平安银行' },
    ])
    expect(pingan.rows).toHaveLength(18)
    expect(pingan.rows.at(-1)).toMatchObject({ year: 2025, holdersTotal: 455168, avgHoldShares: 42634 })
  })
})

describe('szse browser payload', () => {
  it('keeps one padded code per company and one row per year', () => {
    const payload = buildSzseClientPayload(model)
    expect(payload.years).toHaveLength(18)
    expect(payload.companies).toHaveLength(3033)
    expect(payload.companies[0].c).toBe('000001')
    expect(payload.companies.every((company) => company.c.length === 6)).toBe(true)

    const pingan = payload.companies.find((company) => company.c === '000001')!
    expect(pingan.h?.[0]).toEqual([2008, '深发展A'])
    expect(pingan.r).toHaveLength(18)
    expect(pingan.r[0]?.[0]).toBe(27.82)
    expect(pingan.r[0]?.[1]).toBe(294889)
    expect(pingan.r.at(-1)?.[8]).toBeCloseTo(86.76, 2)
  })
})
