import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { SZSE_BOARDS, type SzseBoard, type SzsePanelRow } from './szse'

/**
 * The vendored copy of surfer's Shenzhen panel. The file is the source of truth for
 * the page and the download; the parser is strict because a shifted column would be
 * invisible in the rendered percentages.
 */

export const SZSE_CSV_PATH = fileURLToPath(
  new URL('../../../public/data/szse-shareholders/panel.csv', import.meta.url),
)

const HEADER = [
  'year',
  'sec_code',
  'sec_name',
  'board',
  'negotiable_10k',
  'holders_total',
  'h_lt1k',
  'p_lt1k',
  'h_1k_5k',
  'p_1k_5k',
  'h_5k_10k',
  'p_5k_10k',
  'h_10k_50k',
  'p_10k_50k',
  'h_50k_100k',
  'p_50k_100k',
  'h_gt100k',
  'p_gt100k',
  'avg_hold_shares',
]

const fail = (line: number, reason: string): never => {
  throw new Error(`szse panel.csv line ${line}: ${reason}`)
}

const number = (value: string, line: number, column: string): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) fail(line, `${column} is not a number: ${JSON.stringify(value)}`)
  return parsed
}

export function parseSzseCsv(text: string): SzsePanelRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length === 0) throw new Error('szse panel.csv is empty')

  const header = lines[0].split(',')
  if (header.length !== HEADER.length || header.some((cell, index) => cell !== HEADER[index])) {
    throw new Error(`szse panel.csv header does not match the expected ${HEADER.length} columns: ${header.join(',')}`)
  }

  return lines.slice(1).map((line, index) => {
    const lineNumber = index + 2
    const cells = line.split(',')
    if (cells.length !== HEADER.length) fail(lineNumber, `expected ${HEADER.length} columns, got ${cells.length}`)

    const board = cells[3] as SzseBoard
    if (!SZSE_BOARDS.includes(board)) fail(lineNumber, `unknown board ${JSON.stringify(board)}`)

    return {
      year: number(cells[0], lineNumber, 'year'),
      code: number(cells[1], lineNumber, 'sec_code'),
      name: cells[2],
      board,
      negotiable10k: number(cells[4], lineNumber, 'negotiable_10k'),
      holdersTotal: number(cells[5], lineNumber, 'holders_total'),
      holderCounts: [
        number(cells[6], lineNumber, 'h_lt1k'),
        number(cells[8], lineNumber, 'h_1k_5k'),
        number(cells[10], lineNumber, 'h_5k_10k'),
        number(cells[12], lineNumber, 'h_10k_50k'),
        number(cells[14], lineNumber, 'h_50k_100k'),
        number(cells[16], lineNumber, 'h_gt100k'),
      ],
      percentages: [
        number(cells[7], lineNumber, 'p_lt1k'),
        number(cells[9], lineNumber, 'p_1k_5k'),
        number(cells[11], lineNumber, 'p_5k_10k'),
        number(cells[13], lineNumber, 'p_10k_50k'),
        number(cells[15], lineNumber, 'p_50k_100k'),
        number(cells[17], lineNumber, 'p_gt100k'),
      ],
      avgHoldShares: number(cells[18], lineNumber, 'avg_hold_shares'),
    }
  })
}

export function loadSzseRows(): SzsePanelRow[] {
  return parseSzseCsv(readFileSync(SZSE_CSV_PATH, 'utf8'))
}
