import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const read = (...segments: string[]) => readFileSync(resolve(root, ...segments), 'utf8')

describe('shareholder table wiring', () => {
  it('keeps the page, the table, the data endpoint and the stylesheet connected', () => {
    const page = read('src', 'pages', '[locale]', 'shareholders.astro')
    const table = read('src', 'components', 'shareholders', 'HolderTable.astro')
    const script = read('src', 'scripts', 'shareholder-table.ts')

    expect(page).toContain('<HolderTable')
    expect(page).toContain('<DataNotes')
    expect(page).toContain('PANEL_CSV_URL')
    expect(page).toContain('shareholders.css')
    expect(page).toContain("import '../../scripts/shareholder-table'")
    expect(table).toContain('data-holder-table')
    expect(table).toContain('type="search"')
    expect(table).toContain('data-holder-year')
    expect(table).toContain('aria-sort')
    expect(script).toContain("addEventListener('input'")
    expect(script).toContain("addEventListener('change'")
    expect(script).toContain("addEventListener('click'")

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

  it('records the table pattern in the design language', () => {
    const patterns = read('design', 'patterns.md')
    expect(patterns).toContain('## The shareholder table')
    expect(patterns).toContain('A chart always has a hairline table')
    expect(patterns).toContain('clicks a header to sort')
  })
})
