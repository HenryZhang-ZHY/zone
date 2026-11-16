/**
 * Formatting shared by the page and the browser.
 *
 * The table and the accordion print the same numbers, so the helpers live in one
 * place. `formatShares` takes 万股, the unit of the source table.
 */

const decimal = (value: number, digits: number): string =>
  value.toLocaleString('zh-Hans', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const signed = (value: number, digits = 1): string => {
  const factor = 10 ** digits
  // The epsilon keeps printed 2dp values such as −4.95 from rounding down on
  // their binary representation; the table rounds half away from zero.
  const rounded = (Math.sign(value) * Math.round(Math.abs(value) * factor + 1e-9)) / factor
  if (Math.abs(rounded) < 0.5 / factor) return decimal(0, digits)
  return rounded > 0 ? `+${decimal(rounded, digits)}` : `−${decimal(Math.abs(rounded), digits)}`
}

/** `21.7%`; one decimal is the table's working precision. */
export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—'
  const factor = 10 ** digits
  const rounded = Math.round(Math.abs(value) * factor + 1e-9) / factor
  const body = decimal(Math.abs(rounded) < 0.5 / factor ? 0 : rounded, digits)
  return `${value < 0 && body !== decimal(0, digits) ? '−' : ''}${body}%`
}

/** `+3.3` / `−2.2`, with the unit left to the sentence. */
export function formatDelta(value: number, digits = 1): string {
  return Number.isFinite(value) ? signed(value, digits) : '—'
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('zh-Hans', { maximumFractionDigits: 0 }).format(value)
}

/** 万股 → the unit a reader can hold in their head. */
export function formatShares(hold10k: number): string {
  if (!Number.isFinite(hold10k)) return '—'
  const yi = hold10k / 1e4
  if (yi >= 1e4) return `${decimal(yi / 1e4, 2)} 万亿股`
  if (yi >= 100) return `${decimal(yi, 1)} 亿股`
  return `${decimal(yi, 2)} 亿股`
}
