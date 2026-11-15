import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { BOARDS, type Board, type NameSource, type PanelRow } from './types'

/**
 * The vendored copy of surfer's `data/panel.csv`. The file is the single source of
 * truth for both the downloadable raw data and every number on the page.
 */
export const PANEL_CSV_PATH = fileURLToPath(
  new URL('../../../public/data/sse-shareholders/panel.csv', import.meta.url),
)

const HEADER = [
  'edition',
  'data_year',
  'sec_code',
  'sec_name',
  'name_source',
  'board',
  'total_hold_10k',
  'individual_hold_10k',
  'individual_pct',
  'corporate_hold_10k',
  'corporate_pct',
  'institution_hold_10k',
  'institution_pct',
  'other_hold_10k',
  'other_pct',
]

const NAME_SOURCES: readonly NameSource[] = ['native', 'decoded', 'neighbor']

const fail = (line: number, reason: string): never => {
  throw new Error(`panel.csv line ${line}: ${reason}`)
}

const number = (value: string, line: number, column: string): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) fail(line, `${column} is not a number: ${JSON.stringify(value)}`)
  return parsed
}

/**
 * Parses the vendored panel. The file has no quoting and no commas in names, so the
 * strict 15-column split is a validation, not a shortcut — a different export should
 * fail loudly instead of producing half-empty rows.
 */
export function parsePanelCsv(text: string): PanelRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length === 0) throw new Error('panel.csv is empty')

  const header = lines[0].split(',')
  if (header.length !== HEADER.length || header.some((cell, index) => cell !== HEADER[index])) {
    throw new Error(`panel.csv header does not match the expected 15 columns: ${header.join(',')}`)
  }

  return lines.slice(1).map((line, index) => {
    const lineNumber = index + 2
    const cells = line.split(',')
    if (cells.length !== HEADER.length) fail(lineNumber, `expected ${HEADER.length} columns, got ${cells.length}`)

    const board = cells[5] as Board
    if (!BOARDS.includes(board)) fail(lineNumber, `unknown board ${JSON.stringify(board)}`)

    const nameSource = cells[4] as NameSource
    if (!NAME_SOURCES.includes(nameSource)) fail(lineNumber, `unknown name_source ${JSON.stringify(nameSource)}`)

    return {
      edition: number(cells[0], lineNumber, 'edition'),
      year: number(cells[1], lineNumber, 'data_year'),
      code: number(cells[2], lineNumber, 'sec_code'),
      name: cells[3],
      nameSource,
      board,
      totalHold10k: number(cells[6], lineNumber, 'total_hold_10k'),
      individualHold10k: number(cells[7], lineNumber, 'individual_hold_10k'),
      individualPct: number(cells[8], lineNumber, 'individual_pct'),
      corporateHold10k: number(cells[9], lineNumber, 'corporate_hold_10k'),
      corporatePct: number(cells[10], lineNumber, 'corporate_pct'),
      institutionHold10k: number(cells[11], lineNumber, 'institution_hold_10k'),
      institutionPct: number(cells[12], lineNumber, 'institution_pct'),
      otherHold10k: number(cells[13], lineNumber, 'other_hold_10k'),
      otherPct: number(cells[14], lineNumber, 'other_pct'),
    }
  })
}

/** Reads and parses the vendored panel at build time. */
export function loadPanelRows(): PanelRow[] {
  return parsePanelCsv(readFileSync(PANEL_CSV_PATH, 'utf8'))
}
