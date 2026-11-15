import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const read = (...segments: string[]) => readFileSync(resolve(root, ...segments), 'utf8')

describe('shareholder panel wiring', () => {
  it('keeps the page, the data endpoint and the stylesheet connected', () => {
    const page = read('src', 'pages', '[locale]', 'shareholders.astro')
    const chart = read('src', 'components', 'shareholders', 'MarketChart.astro')
    const lookup = read('src', 'components', 'shareholders', 'StockLookup.astro')

    expect(page).toContain('<MarketChart')
    expect(page).toContain('<StockLookup')
    expect(page).toContain('PANEL_CSV_URL')
    expect(page).toContain('shareholders.css')
    expect(page).toContain("import '../../scripts/shareholder-panel'")
    expect(chart).toContain('data-market-chart')
    expect(lookup).toContain('data-stock-lookup')

    const endpoint = read('src', 'pages', 'data', 'sse-shareholders', 'panel.json.ts')
    expect(endpoint).toContain('buildClientPayload')
    expect(endpoint).toContain('loadPanelRows')
  })

  it('ships the raw CSV next to the page that downloads it', () => {
    const csv = read('public', 'data', 'sse-shareholders', 'panel.csv')
    const lines = csv.trim().split(/\r?\n/)
    expect(lines[0].split(',')).toHaveLength(15)
    expect(lines).toHaveLength(24585)
  })

  it('records the panel pattern in the design language', () => {
    const patterns = read('design', 'patterns.md')
    expect(patterns).toContain('## The panel')
    expect(patterns).toContain('A chart always has a hairline table')
  })
})
