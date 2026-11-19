import type { ClientCompany, ClientPayload } from '../lib/shareholders/types'
import type { SzseClientCompany, SzseClientPayload } from '../lib/shareholders/szse'
import {
  HISTORY_KEYS,
  HISTORY_LABELS,
  boardLabel,
  buildHistory,
  buildSzseHistory,
  columnsForMarket,
  columnsForRows,
  companyNameAt,
  escapeHtml,
  historyAriaLabel,
  historyLatest,
  historyPath,
  historySummary,
  historyX,
  historyY,
  lastPoint,
  matchesTableRow,
  sortTableRows,
  sseTableRows,
  szseHistoryAriaLabel,
  szseHistorySummary,
  szseLastPoint,
  szseTableRows,
  tableEmptyRowHtml,
  tableHeadHtml,
  tableLoadingRowHtml,
  tableRowHtml,
  type ColumnDef,
  type History,
  type HistoryKey,
  type HistoryPoint,
  type Market,
  type MarketInfo,
  type SzseHistory,
  type SzseHistoryPoint,
  type TableRow,
} from '../lib/shareholders/table'
import { formatCount, formatPercent, formatShares } from '../lib/shareholders/view'

/**
 * The shareholder table's browser side.
 *
 * The two yearbooks are separate datasets with different columns, so the page
 * switches between them. Only the rows around the viewport are rendered: a fixed
 * row height plus one optional accordion detail row are kept as virtual items.
 * Search and sort run on the row arrays, not on the DOM.
 */

type Payload = ClientPayload | SzseClientPayload

interface Elements {
  root: HTMLElement
  viewport: HTMLElement
  head: HTMLTableSectionElement
  body: HTMLTableSectionElement
  search: HTMLInputElement
  year: HTMLSelectElement
  count: HTMLElement
  caption: HTMLElement
  status: HTMLElement
  tabs: HTMLButtonElement[]
}

interface ActiveTable {
  market: Market
  info: MarketInfo
  columns: readonly ColumnDef[]
  payload: Payload | null
  year: number
  rows: TableRow[]
  visible: TableRow[]
  sortKey: string
  direction: 'asc' | 'desc'
  query: string
  openIndex: number | null
  detail: HTMLTableRowElement | null
  detailCell: HTMLTableCellElement | null
  detailHeight: number
  detailToken: number
  observer: ResizeObserver | null
}

const OVERSCAN = 6
const payloads = new Map<Market, Payload>()
const loading = new Map<Market, Promise<Payload>>()
const selectedYears = new Map<Market, number>()
const columnsCache = new Map<string, readonly ColumnDef[]>()

let elements: Elements
let infos: Record<Market, MarketInfo>
let active: ActiveTable | null = null
let lastSignature = ''
let scrollFrame = 0
let keyboardMode = false

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

const formatWan = (value: number, digits: number): string =>
  (value / 1e4).toLocaleString('zh-Hans', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

// The legend gives the categories in order; the readout carries only the numbers.
const SSE_READOUT = (point: HistoryPoint): string =>
  `${point.year} 年末 · ${formatPercent(point.individual)} · ${formatPercent(point.corporate)} · ${formatPercent(
    point.institution,
  )} · ${formatPercent(point.other, 2)}`

const SZSE_READOUT = (point: SzseHistoryPoint): string =>
  `${point.year} 年末 · 股东 ${formatWan(point.holders, 1)} 万户 · 户均 ${formatWan(
    point.avgHold,
    2,
  )} 万股 · ${formatPercent(point.small)} · ${formatPercent(point.mid)} · ${formatPercent(point.large)}`

const rowHeightPx = (): number => {
  const value = getComputedStyle(elements.viewport).getPropertyValue('--holder-row-height')
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 44
}

/* ------------------------------------------------------------------ */
/* URLs and status                                                     */
/* ------------------------------------------------------------------ */

function writeMarketParam(market: Market): void {
  const url = new URL(window.location.href)
  if (market === 'sse') url.searchParams.delete('market')
  else url.searchParams.set('market', market)
  window.history.replaceState(null, '', url)
}

function setStockParam(code: string | null): void {
  const url = new URL(window.location.href)
  if (code) {
    if (url.searchParams.get('stock') === code) return
    url.searchParams.set('stock', code)
  } else {
    if (!url.searchParams.has('stock')) return
    url.searchParams.delete('stock')
  }
  window.history.replaceState(null, '', url)
}

function status(text: string): void {
  elements.status.textContent = text
}

/* ------------------------------------------------------------------ */
/* Payload                                                             */
/* ------------------------------------------------------------------ */

function loadPayload(info: MarketInfo): Promise<Payload> {
  const cached = payloads.get(info.id)
  if (cached) return Promise.resolve(cached)
  const pending = loading.get(info.id)
  if (pending) return pending

  const request = fetch(info.jsonUrl, { headers: { accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json() as Promise<Payload>
    })
    .then((payload) => {
      payloads.set(info.id, payload)
      return payload
    })
    .finally(() => loading.delete(info.id))

  loading.set(info.id, request)
  return request
}

/* ------------------------------------------------------------------ */
/* Table state                                                         */
/* ------------------------------------------------------------------ */

function buildRows(table: ActiveTable, year: number): TableRow[] {
  if (!table.payload) return []
  if (table.market === 'sse') return sseTableRows(table.payload as ClientPayload, year)
  return szseTableRows(table.payload as SzseClientPayload, year)
}

function filteredRows(table: ActiveTable): TableRow[] {
  const query = table.query.trim()
  const rows = query === '' ? table.rows : table.rows.filter((row) => matchesTableRow(row, query))
  return sortTableRows(rows, table.sortKey, table.direction)
}

function setColumns(table: ActiveTable): boolean {
  const next = columnsForRows(table.market, table.rows)
  const changed = next.length !== table.columns.length
  table.columns = next
  columnsCache.set(`${table.market}:${table.year}`, next)
  if (!next.some((column) => column.key === table.sortKey)) {
    table.sortKey = 'code'
    table.direction = 'asc'
    return true
  }
  return changed
}

function updateCount(table: ActiveTable): void {
  elements.count.textContent =
    table.query.trim() === ''
      ? formatCount(table.visible.length)
      : `${formatCount(table.visible.length)} / ${formatCount(table.rows.length)}`
}

function updateCaption(table: ActiveTable): void {
  const columns =
    table.market === 'sse'
      ? table.columns.some((column) => column.key === 'other')
        ? '自然人、一般法人、专业机构与其他持股比例'
        : '自然人、一般法人与专业机构持股比例'
      : '股东数、户均持股、三档持股比例与托管流通股'
  elements.caption.textContent = `${table.info.label} ${table.year} 年末个股股东结构表。列有${columns}；各列可按升序或降序排列，每只股票可展开历年变化。`
}

function updateTabs(): void {
  for (const tab of elements.tabs) {
    tab.setAttribute('aria-pressed', String(tab.dataset.market === active?.market))
  }
}

function renderHeader(table: ActiveTable): void {
  elements.head.innerHTML = tableHeadHtml(table.columns, table.sortKey, table.direction)
}

function updateSortHeader(table: ActiveTable): void {
  for (const cell of elements.head.querySelectorAll<HTMLTableCellElement>('th[data-sort-th]')) {
    const key = cell.dataset.sortTh
    const active = key === table.sortKey
    cell.setAttribute('aria-sort', active ? (table.direction === 'asc' ? 'ascending' : 'descending') : 'none')
    const mark = cell.querySelector<HTMLElement>('[data-sort-mark]')
    if (mark) mark.textContent = active ? (table.direction === 'asc' ? '↑' : '↓') : ''
  }
}

function renderYearOptions(table: ActiveTable): void {
  const years = [...table.info.years].sort((first, second) => second - first)
  elements.year.innerHTML = years
    .map((year) => `<option value="${year}"${year === table.year ? ' selected' : ''}>${year}</option>`)
    .join('')
  elements.year.value = String(table.year)
}

function renderLoading(table: ActiveTable): void {
  renderHeader(table)
  elements.body.innerHTML = tableLoadingRowHtml(visibleColumnCount())
}

function renderError(table: ActiveTable, text: string): void {
  elements.body.innerHTML = `<tr class="holder-loading"><td colspan="${visibleColumnCount()}">${escapeHtml(
    text,
  )} <button type="button" class="holder-retry" data-retry>重试</button></td></tr>`
}

/* ------------------------------------------------------------------ */
/* Virtual window                                                      */
/* ------------------------------------------------------------------ */

function visibleColumnCount(): number {
  return [...elements.head.querySelectorAll<HTMLTableCellElement>('th[data-sort-th]')].filter(
    (cell) => getComputedStyle(cell).display !== 'none',
  ).length
}

function hasDetail(table: ActiveTable): boolean {
  return table.openIndex !== null && table.detail !== null
}

function detailItemIndex(table: ActiveTable): number {
  return table.openIndex === null ? -1 : table.openIndex + 1
}

function itemCount(table: ActiveTable): number {
  return table.visible.length + (hasDetail(table) ? 1 : 0)
}

function itemTop(table: ActiveTable, index: number, rowHeight: number): number {
  if (!hasDetail(table)) return index * rowHeight
  const open = table.openIndex!
  if (index <= open) return index * rowHeight
  if (index === open + 1) return (open + 1) * rowHeight
  return (index - 1) * rowHeight + table.detailHeight
}

function itemHeight(table: ActiveTable, index: number, rowHeight: number): number {
  return hasDetail(table) && index === detailItemIndex(table) ? table.detailHeight : rowHeight
}

function itemRowIndex(table: ActiveTable, index: number): number | null {
  if (!hasDetail(table)) return index
  const open = table.openIndex!
  if (index <= open) return index
  if (index === open + 1) return null
  return index - 1
}

function firstVisibleItem(table: ActiveTable, scrollTop: number, rowHeight: number): number {
  const count = itemCount(table)
  let low = 0
  let high = count - 1
  let answer = 0
  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    if (itemTop(table, middle, rowHeight) <= scrollTop) {
      answer = middle
      low = middle + 1
    } else {
      high = middle - 1
    }
  }
  return answer
}

function spacerRow(colspan: number, height: number): string {
  return `<tr class="holder-spacer" aria-hidden="true"><td colspan="${colspan}" style="height:${Math.max(
    0,
    Math.round(height),
  )}px"></td></tr>`
}

function renderWindow(force = false): void {
  if (!active || !active.payload) return
  if (active.visible.length === 0) {
    if (lastSignature !== `empty:${active.market}:${active.year}`) {
      active.detail?.remove()
      elements.body.innerHTML = tableEmptyRowHtml(visibleColumnCount())
      lastSignature = `empty:${active.market}:${active.year}`
    }
    return
  }

  const rowHeight = rowHeightPx()
  const count = itemCount(active)
  const scrollTop = elements.viewport.scrollTop
  const viewportHeight = elements.viewport.clientHeight
  const start = Math.max(0, firstVisibleItem(active, scrollTop, rowHeight) - OVERSCAN)
  const limit = scrollTop + viewportHeight + OVERSCAN * rowHeight
  let end = Math.min(count, start + 1)
  while (end < count && itemTop(active, end, rowHeight) < limit) end += 1

  const signature = `${active.market}:${active.year}:${start}:${end}:${active.openIndex}:${Math.round(
    active.detailHeight,
  )}:${active.visible.length}:${active.columns.length}:${rowHeight}`
  if (!force && signature === lastSignature) return
  lastSignature = signature

  const focused = document.activeElement as HTMLElement | null
  const focusVisible = focused?.matches(':focus-visible') ?? false
  const focusedRowCode = focusVisible ? focused?.closest<HTMLTableRowElement>('tr.holder-row')?.dataset.code ?? null : null
  const focusedDetailClose = focusVisible ? Boolean(focused?.closest('[data-close-detail]')) : false

  const total = itemTop(active, count - 1, rowHeight) + itemHeight(active, count - 1, rowHeight)
  const top = itemTop(active, start, rowHeight)
  const endBottom = itemTop(active, end - 1, rowHeight) + itemHeight(active, end - 1, rowHeight)

  const colspan = visibleColumnCount()
  let html = top > 0.5 ? spacerRow(colspan, top) : ''
  for (let index = start; index < end; index += 1) {
    const rowIndex = itemRowIndex(active, index)
    if (rowIndex === null) continue
    const row = active.visible[rowIndex]
    const isOpen = active.openIndex === rowIndex
    html += tableRowHtml(row, active.columns, true, isOpen, isOpen ? `holder-detail-${row.code}` : undefined)
  }
  const bottom = total - endBottom
  if (bottom > 0.5) html += spacerRow(colspan, bottom)

  active.detail?.remove()
  elements.body.innerHTML = html

  if (hasDetail(active) && active.detail) {
    const detailIndex = detailItemIndex(active)
    if (detailIndex >= start && detailIndex < end) {
      const openRowCode = active.visible[active.openIndex!]?.code
      const openRow = openRowCode
        ? elements.body.querySelector<HTMLTableRowElement>(`tr.holder-row[data-code="${openRowCode}"]`)
        : null
      if (openRow) openRow.after(active.detail)
      else {
        const firstRow = elements.body.querySelector<HTMLTableRowElement>('tr.holder-row')
        if (firstRow) firstRow.before(active.detail)
        else elements.body.append(active.detail)
      }
    }
  }

  if (focusedRowCode) {
    elements.body
      .querySelector<HTMLButtonElement>(`tr.holder-row[data-code="${focusedRowCode}"] [data-row-toggle]`)
      ?.focus({ preventScroll: true })
  } else if (focusedDetailClose && active.detail) {
    active.detail.querySelector<HTMLButtonElement>('[data-close-detail]')?.focus({ preventScroll: true })
  }
}

function scheduleRender(): void {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0
    renderWindow()
  })
}

/* ------------------------------------------------------------------ */
/* Detail shell                                                        */
/* ------------------------------------------------------------------ */

function detailShell(
  name: string,
  code: string,
  meta: string[],
  summary: string,
  chart: string,
  yearTable: string,
): string {
  const titleId = `holder-detail-title-${code}`
  return `<div class="holder-detail" role="region" aria-labelledby="${titleId}">
    <header class="holder-detail__head">
      <div class="holder-detail__identity">
        <h3 class="holder-detail__title" id="${titleId}">${escapeHtml(
          name,
        )}<span class="holder-detail__code">${code}</span></h3>
        <p class="holder-detail__meta">${meta.map(escapeHtml).join(' · ')}</p>
      </div>
      <button type="button" class="holder-detail__close" data-close-detail aria-label="收起 ${escapeHtml(
        name,
      )} 的历年数据">收起 <span aria-hidden="true">×</span></button>
    </header>
    <p class="holder-detail__summary">${summary}</p>
    ${chart}
    ${yearTable}
  </div>`
}

/* ------------------------------------------------------------------ */
/* SSE detail                                                          */
/* ------------------------------------------------------------------ */

function sseChartDots(history: History): string {
  return HISTORY_KEYS.map((key) => {
    const point = historyLatest(history, key)
    if (!point) return ''
    return `<span class="holder-chart__dot holder-chart__dot--${key}" data-dot="${key}" aria-hidden="true" style="left:${historyX(
      point.index,
      history.length,
    )}%;top:${historyY(point.value)}%"></span>`
  }).join('')
}

function sseChartHtml(name: string, years: number[], history: History): string {
  const point = lastPoint(history)
  const firstYear = history.find((entry): entry is HistoryPoint => entry !== null)?.year
  const breakYears = [2009, 2022].filter(
    (year) => firstYear !== undefined && point !== null && firstYear <= year && year <= point.year,
  )

  const grids = [0, 25, 50, 75, 100]
    .map(
      (value) =>
        `<line class="holder-chart__grid" x1="0" x2="100" y1="${100 - value}" y2="${100 - value}" />`,
    )
    .join('')

  const breaks = breakYears
    .map((year) => {
      const index = years.indexOf(year)
      if (index < 0) return ''
      const x = historyX(index, years.length)
      return `<line class="holder-chart__break" x1="${x}" x2="${x}" y1="0" y2="100" />`
    })
    .join('')

  const paths = HISTORY_KEYS.map(
    (key) => `<path class="holder-chart__line holder-chart__line--${key}" d="${historyPath(history, key)}" />`,
  ).join('')

  const legend = HISTORY_KEYS.map(
    (key) =>
      `<li><span class="holder-chart__swatch holder-chart__swatch--${key}" aria-hidden="true"></span>${HISTORY_LABELS[key]}</li>`,
  ).join('')

  const notes: string[] = []
  if (breaks.length > 0) {
    notes.push(
      `虚线：${breakYears.map((year) => (year === 2009 ? '2009 起总股本口径' : '2022 起分类调整')).join(' · ')}。`,
    )
  }
  if (history.some((entry) => entry === null)) notes.push('断点：该年末未收录。')

  return `<figure class="holder-chart">
    <div class="holder-chart__body">
      <div class="holder-chart__yaxis" aria-hidden="true">
        <span style="top:0%">100%</span><span style="top:25%">75%</span><span style="top:50%">50%</span><span style="top:75%">25%</span><span style="top:100%">0%</span>
      </div>
      <div class="holder-chart__plot" data-chart-plot>
        <svg class="holder-chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(
          historyAriaLabel(name, history),
        )}">
          ${grids}${breaks}${paths}
        </svg>
        <span class="holder-chart__crosshair" data-crosshair hidden></span>
        ${sseChartDots(history)}
      </div>
    </div>
    <div class="holder-chart__years" style="grid-template-columns:repeat(${years.length}, minmax(0, 1fr))" aria-hidden="true">
      ${years.map((year) => `<span>${year}</span>`).join('')}
    </div>
    <figcaption class="holder-chart__caption">
      <ul class="holder-chart__legend">${legend}</ul>
      <p class="holder-chart__readout" data-readout>${point ? SSE_READOUT(point) : '—'}</p>
      ${notes.length > 0 ? `<p class="holder-chart__note">${notes.join(' ')}</p>` : ''}
    </figcaption>
  </figure>`
}

function bindSseChart(container: HTMLElement, history: History, years: number[]): void {
  const plot = container.querySelector<HTMLElement>('[data-chart-plot]')
  const readout = container.querySelector<HTMLElement>('[data-readout]')
  const crosshair = container.querySelector<HTMLElement>('[data-crosshair]')
  if (!plot || !readout || !crosshair) return

  const dots = new Map<HistoryKey, HTMLElement>()
  for (const key of HISTORY_KEYS) {
    const dot = container.querySelector<HTMLElement>(`[data-dot="${key}"]`)
    if (dot) dots.set(key, dot)
  }

  const latest = lastPoint(history)
  const reset = () => {
    crosshair.hidden = true
    for (const key of HISTORY_KEYS) {
      const dot = dots.get(key)
      const point = historyLatest(history, key)
      if (!dot) continue
      if (!point) {
        dot.hidden = true
        continue
      }
      dot.hidden = false
      dot.style.left = `${historyX(point.index, history.length)}%`
      dot.style.top = `${historyY(point.value)}%`
    }
    readout.textContent = latest ? SSE_READOUT(latest) : '—'
  }

  plot.addEventListener('pointermove', (event) => {
    const rect = plot.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = Math.min(0.9999, Math.max(0, (event.clientX - rect.left) / rect.width))
    const index = Math.floor(ratio * history.length)
    const point = history[index]
    const x = historyX(index, history.length)
    crosshair.style.left = `${x}%`
    crosshair.hidden = false

    if (!point) {
      for (const dot of dots.values()) dot.hidden = true
      readout.textContent = `${years[index]} 年末 · 无记录`
      return
    }

    for (const key of HISTORY_KEYS) {
      const dot = dots.get(key)
      if (!dot) continue
      dot.hidden = false
      dot.style.left = `${x}%`
      dot.style.top = `${historyY(point[key])}%`
    }
    readout.textContent = SSE_READOUT(point)
  })

  plot.addEventListener('pointerleave', reset)
}

function sseYearTable(history: History): string {
  const points = history.filter((point): point is HistoryPoint => point !== null)
  const rows = points
    .map(
      (point) => `<tr>
        <th scope="row">${point.year}</th>
        <td>${formatShares(point.totalYi * 1e4)}</td>
        <td>${formatPercent(point.individual)}</td>
        <td>${formatPercent(point.corporate)}</td>
        <td>${formatPercent(point.institution)}</td>
        <td>${formatPercent(point.other, 2)}</td>
      </tr>`,
    )
    .join('')

  return `<details class="holder-years">
    <summary class="holder-years__summary"><span>逐年数据</span><span class="holder-years__count">${points.length} 年</span></summary>
    <div class="holder-years__wrap">
      <table class="holder-years__table">
        <caption class="sr-only">各年末的合计持股与四类股东持股比例。</caption>
        <thead><tr><th scope="col">年末</th><th scope="col">合计</th><th scope="col">自然人</th><th scope="col">一般法人</th><th scope="col">专业机构</th><th scope="col">其他</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </details>`
}

function errorDetail(text: string): HTMLElement {
  const container = document.createElement('div')
  container.innerHTML = `<div class="holder-detail" role="region"><p class="holder-detail__error" role="alert">${escapeHtml(
    text,
  )}</p></div>`
  return container.firstElementChild as HTMLElement
}

function sseDetail(
  table: ActiveTable,
  company: ClientCompany,
  payload: ClientPayload,
): HTMLElement {
  const history = buildHistory(company, payload.years)
  const point = lastPoint(history)
  const first = history.find((entry): entry is HistoryPoint => entry !== null)
  if (!point || !first) return errorDetail('没有可展示的历史记录。')

  const name = companyNameAt(company, table.year)
  const firstIndex = history.findIndex((entry) => entry !== null)
  const lastIndex = history.reduce((index, entry, rowIndex) => (entry ? rowIndex : index), -1)
  const chartYears = payload.years.slice(firstIndex, lastIndex + 1)
  const chartHistory = history.slice(firstIndex, lastIndex + 1)
  const renamed = company.n !== name
  const delisted = point.year < payload.years.at(-1)!
  const meta = [boardLabel(company.b), `${first.year}–${point.year} 年末`]
  if (renamed) meta.push(`现名 ${company.n}`)
  if (delisted) meta.push(`最后收录 ${point.year} 年末`)

  const container = document.createElement('div')
  container.innerHTML = detailShell(
    name,
    company.c,
    meta,
    historySummary(history),
    sseChartHtml(name, chartYears, chartHistory),
    sseYearTable(history),
  )
  const content = container.firstElementChild as HTMLElement
  bindSseChart(content, chartHistory, chartYears)
  return content
}

/* ------------------------------------------------------------------ */
/* SZSE detail                                                         */
/* ------------------------------------------------------------------ */

function szseChartHtml(name: string, years: number[], history: SzseHistory): string {
  const point = szseLastPoint(history)
  const slot = 100 / Math.max(1, years.length)
  const width = slot * 0.58

  const bars = history
    .map((entry, index) => {
      if (!entry) return ''
      const left = historyX(index, years.length) - width / 2
      const large = Math.max(0, entry.large)
      const mid = Math.max(0, entry.mid)
      const small = Math.max(0, entry.small)
      return `<g class="holder-chart__column" data-year-index="${index}">
        <rect class="holder-chart__bar holder-chart__bar--large" x="${left}" y="0" width="${width}" height="${large}" />
        <rect class="holder-chart__bar holder-chart__bar--mid" x="${left}" y="${large}" width="${width}" height="${mid}" />
        <rect class="holder-chart__bar holder-chart__bar--small" x="${left}" y="${large + mid}" width="${width}" height="${small}" />
      </g>`
    })
    .join('')

  const grids = [0, 25, 50, 75, 100]
    .map(
      (value) =>
        `<line class="holder-chart__grid" x1="0" x2="100" y1="${100 - value}" y2="${100 - value}" />`,
    )
    .join('')

  const legend = [
    { key: 'small', label: '＜1万' },
    { key: 'mid', label: '1万–10万' },
    { key: 'large', label: '＞10万' },
  ]
    .map(
      (item) =>
        `<li><span class="holder-chart__swatch holder-chart__swatch--${item.key}" aria-hidden="true"></span>${item.label}</li>`,
    )
    .join('')

  const notes: string[] = []
  if (history.some((entry) => entry === null)) notes.push('空白：该年末未收录。')

  return `<figure class="holder-chart">
    <div class="holder-chart__body">
      <div class="holder-chart__yaxis" aria-hidden="true">
        <span style="top:0%">100%</span><span style="top:25%">75%</span><span style="top:50%">50%</span><span style="top:75%">25%</span><span style="top:100%">0%</span>
      </div>
      <div class="holder-chart__plot" data-chart-plot>
        <svg class="holder-chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(
          szseHistoryAriaLabel(name, history),
        )}">
          ${grids}${bars}
        </svg>
        <span class="holder-chart__crosshair" data-crosshair hidden></span>
      </div>
    </div>
    <div class="holder-chart__years" style="grid-template-columns:repeat(${years.length}, minmax(0, 1fr))" aria-hidden="true">
      ${years.map((year) => `<span>${year}</span>`).join('')}
    </div>
    <figcaption class="holder-chart__caption">
      <ul class="holder-chart__legend">${legend}</ul>
      <p class="holder-chart__readout" data-readout>${point ? SZSE_READOUT(point) : '—'}</p>
      ${notes.length > 0 ? `<p class="holder-chart__note">${notes.join(' ')}</p>` : ''}
    </figcaption>
  </figure>`
}

function bindSzseChart(container: HTMLElement, history: SzseHistory, years: number[]): void {
  const plot = container.querySelector<HTMLElement>('[data-chart-plot]')
  const readout = container.querySelector<HTMLElement>('[data-readout]')
  const crosshair = container.querySelector<HTMLElement>('[data-crosshair]')
  if (!plot || !readout || !crosshair) return

  const latest = szseLastPoint(history)
  const reset = () => {
    crosshair.hidden = true
    readout.textContent = latest ? SZSE_READOUT(latest) : '—'
  }

  plot.addEventListener('pointermove', (event) => {
    const rect = plot.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = Math.min(0.9999, Math.max(0, (event.clientX - rect.left) / rect.width))
    const index = Math.floor(ratio * history.length)
    const point = history[index]
    crosshair.style.left = `${historyX(index, history.length)}%`
    crosshair.hidden = false
    readout.textContent = point ? SZSE_READOUT(point) : `${years[index]} 年末 · 无记录`
  })

  plot.addEventListener('pointerleave', reset)
}

function szseYearTable(history: SzseHistory): string {
  const points = history.filter((point): point is SzseHistoryPoint => point !== null)
  const rows = points
    .map(
      (point) => `<tr>
        <th scope="row">${point.year}</th>
        <td>${formatShares(point.negotiableYi * 1e4)}</td>
        <td>${formatCount(point.holders)}</td>
        <td>${formatCount(point.avgHold)}</td>
        ${point.buckets.map((value) => `<td>${formatPercent(value, 2)}</td>`).join('')}
      </tr>`,
    )
    .join('')

  return `<details class="holder-years">
    <summary class="holder-years__summary"><span>逐年数据</span><span class="holder-years__count">${points.length} 年</span></summary>
    <div class="holder-years__wrap" role="region" aria-label="这只股票的逐年持股规模，可左右滚动" tabindex="0">
      <table class="holder-years__table holder-years__table--wide">
        <caption class="sr-only">各年末的托管流通股、股东总数、户均持股与六档持股率。</caption>
        <thead><tr><th scope="col">年末</th><th scope="col">托管</th><th scope="col">股东数</th><th scope="col">户均</th><th scope="col">＜1千</th><th scope="col">1千–5千</th><th scope="col">5千–1万</th><th scope="col">1万–5万</th><th scope="col">5万–10万</th><th scope="col">＞10万</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </details>`
}

function szseDetail(
  table: ActiveTable,
  company: SzseClientCompany,
  payload: SzseClientPayload,
): HTMLElement {
  const history = buildSzseHistory(company, payload.years)
  const point = szseLastPoint(history)
  const first = history.find((entry): entry is SzseHistoryPoint => entry !== null)
  if (!point || !first) return errorDetail('没有可展示的历史记录。')

  const name = companyNameAt(company, table.year)
  const firstIndex = history.findIndex((entry) => entry !== null)
  const lastIndex = history.reduce((index, entry, rowIndex) => (entry ? rowIndex : index), -1)
  const chartYears = payload.years.slice(firstIndex, lastIndex + 1)
  const chartHistory = history.slice(firstIndex, lastIndex + 1)
  const renamed = company.n !== name
  const delisted = point.year < payload.years.at(-1)!
  const meta = [boardLabel(company.b), `${first.year}–${point.year} 年末`]
  if (renamed) meta.push(`现名 ${company.n}`)
  if (delisted) meta.push(`最后收录 ${point.year} 年末`)

  const container = document.createElement('div')
  container.innerHTML = detailShell(
    name,
    company.c,
    meta,
    szseHistorySummary(history),
    szseChartHtml(name, chartYears, chartHistory),
    szseYearTable(history),
  )
  const content = container.firstElementChild as HTMLElement
  bindSzseChart(content, chartHistory, chartYears)
  return content
}

/* ------------------------------------------------------------------ */
/* Open / close                                                        */
/* ------------------------------------------------------------------ */

function findCompany(table: ActiveTable, code: string): ClientCompany | SzseClientCompany | null {
  if (!table.payload) return null
  if (table.market === 'sse') {
    return (table.payload as ClientPayload).companies.find((company) => company.c === code) ?? null
  }
  return (table.payload as SzseClientPayload).companies.find((company) => company.c === code) ?? null
}

function measureDetail(table: ActiveTable): void {
  if (!table.detail || table.openIndex === null || !table.detail.isConnected) return
  const height = Math.ceil(table.detail.getBoundingClientRect().height)
  if (height <= 0 || Math.abs(height - table.detailHeight) <= 1) return
  table.detailHeight = height
  lastSignature = ''
  renderWindow(true)
}

function closeDetail(table: ActiveTable, updateUrl = true, restoreFocus = true): void {
  if (table.openIndex === null && !table.detail) return
  const code = table.openIndex === null ? null : table.visible[table.openIndex]?.code ?? null
  const row = code
    ? elements.body.querySelector<HTMLTableRowElement>(`tr.holder-row[data-code="${code}"]`)
    : null
  const hadFocus = Boolean(table.detail?.contains(document.activeElement) || row?.contains(document.activeElement))

  table.openIndex = null
  table.detailToken += 1
  table.observer?.disconnect()
  table.observer = null
  table.detail?.remove()
  table.detail = null
  table.detailCell = null
  table.detailHeight = 0
  lastSignature = ''
  if (updateUrl) setStockParam(null)
  renderWindow(true)
  if (restoreFocus && hadFocus && code) focusRow(table, code)
}

function focusRow(table: ActiveTable, code: string): void {
  const index = table.visible.findIndex((row) => row.code === code)
  if (index < 0) return
  elements.viewport.scrollTop = Math.max(0, itemTop(table, index, rowHeightPx()) - 8)
  lastSignature = ''
  renderWindow(true)
  requestAnimationFrame(() => {
    elements.body
      .querySelector<HTMLButtonElement>(`tr.holder-row[data-code="${code}"] [data-row-toggle]`)
      ?.focus({ preventScroll: true })
  })
}

function openDetail(table: ActiveTable, rowIndex: number, focus = false): void {
  if (table.openIndex === rowIndex) {
    closeDetail(table, true, focus)
    return
  }
  if (!table.payload) return
  const row = table.visible[rowIndex]
  if (!row) return

  closeDetail(table, true, false)
  const company = findCompany(table, row.code)
  if (!company) return

  const detail = document.createElement('tr')
  detail.className = 'holder-detail-row'
  detail.id = `holder-detail-${row.code}`
  detail.dataset.holderDetail = ''
  const cell = document.createElement('td')
  cell.className = 'holder-detail-cell'
  cell.colSpan = visibleColumnCount()
  cell.innerHTML = `<div class="holder-detail" role="region"><p class="holder-detail__loading">正在载入 ${escapeHtml(
    row.name,
  )} 的历年数据…</p></div>`
  detail.append(cell)

  table.openIndex = rowIndex
  table.detail = detail
  table.detailCell = cell
  table.detailToken += 1
  table.detailHeight = table.market === 'sse' ? 560 : 640
  lastSignature = ''
  setStockParam(row.code)

  const content =
    table.market === 'sse'
      ? sseDetail(table, company as ClientCompany, table.payload as ClientPayload)
      : szseDetail(table, company as SzseClientCompany, table.payload as SzseClientPayload)
  cell.replaceChildren(content)

  renderWindow(true)
  const rowTop = itemTop(table, rowIndex, rowHeightPx())
  elements.viewport.scrollTop = Math.max(0, rowTop - 8)
  if (focus) {
    elements.body
      .querySelector<HTMLButtonElement>(`tr.holder-row[data-code="${row.code}"] [data-row-toggle]`)
      ?.focus({ preventScroll: true })
  }

  table.observer?.disconnect()
  const detailContent = cell.querySelector<HTMLElement>('.holder-detail') ?? cell
  const observer = new ResizeObserver(() => measureDetail(table))
  observer.observe(detailContent)
  table.observer = observer
  requestAnimationFrame(() => measureDetail(table))
  status(`已展开 ${row.name}。`)
}

/* ------------------------------------------------------------------ */
/* Search, sort, year, market                                          */
/* ------------------------------------------------------------------ */

function applySearch(table: ActiveTable): void {
  closeDetail(table)
  table.query = elements.search.value
  table.visible = filteredRows(table)
  elements.viewport.scrollTop = 0
  lastSignature = ''
  renderWindow(true)
  updateCount(table)
}

function applySort(table: ActiveTable, key: string): void {
  const column = table.columns.find((entry) => entry.key === key)
  if (!column) return
  closeDetail(table)
  if (table.sortKey === key) table.direction = table.direction === 'asc' ? 'desc' : 'asc'
  else {
    table.sortKey = key
    table.direction = column.numeric ? 'desc' : 'asc'
  }
  table.visible = sortTableRows(table.visible, key, table.direction)
  elements.viewport.scrollTop = 0
  updateSortHeader(table)
  lastSignature = ''
  renderWindow(true)
  status(`已按${column.label}${table.direction === 'asc' ? '升序' : '降序'}排列。`)
}

function applyYear(table: ActiveTable, year: number): void {
  if (!table.payload) {
    elements.year.value = String(table.year)
    return
  }
  if (!table.info.years.includes(year) || year === table.year) return
  closeDetail(table)
  table.year = year
  selectedYears.set(table.market, year)
  table.rows = buildRows(table, year)
  const columnsChanged = setColumns(table)
  table.visible = filteredRows(table)
  elements.year.value = String(year)
  elements.viewport.scrollTop = 0
  if (columnsChanged) renderHeader(table)
  updateCaption(table)
  updateCount(table)
  lastSignature = ''
  renderWindow(true)
  status(`已显示${table.info.label} ${year} 年末，共 ${formatCount(table.visible.length)} 只。`)
}

async function activate(
  market: Market,
  options: { year?: number; code?: string; columns?: readonly ColumnDef[]; initial?: boolean } = {},
): Promise<void> {
  const info = infos[market]
  if (!info) return
  if (active) closeDetail(active, false, false)

  const year = options.year ?? selectedYears.get(market) ?? info.latestYear
  const cacheKey = `${market}:${year}`
  const table: ActiveTable = {
    market,
    info,
    columns: options.columns ?? columnsCache.get(cacheKey) ?? columnsForMarket(market),
    payload: null,
    year,
    rows: [],
    visible: [],
    sortKey: 'code',
    direction: 'asc',
    query: '',
    openIndex: null,
    detail: null,
    detailCell: null,
    detailHeight: 0,
    detailToken: 0,
    observer: null,
  }
  active = table
  selectedYears.set(market, year)
  lastSignature = ''
  elements.search.value = ''
  const serverDefault =
    options.initial === true &&
    market === (elements.root.dataset.defaultMarket as Market | undefined) &&
    year === Number(elements.root.dataset.defaultYear)
  elements.year.disabled = !serverDefault
  elements.viewport.scrollTop = 0
  updateTabs()
  renderYearOptions(table)
  renderLoading(table)
  if (!serverDefault) elements.count.textContent = '—'
  writeMarketParam(market)
  status(`正在载入${info.label} ${year} 年末数据…`)

  try {
    const payload = await loadPayload(info)
    if (active !== table) return
    table.payload = payload
    table.rows = buildRows(table, year)
    setColumns(table)
    table.visible = filteredRows(table)
    elements.year.disabled = false
    updateCaption(table)
    renderHeader(table)
    updateCount(table)
    lastSignature = ''
    renderWindow(true)
    status(`${info.label} ${year} 年末，共 ${formatCount(table.rows.length)} 只。`)

    if (options.code) await openLinkedStock(table, options.code)
  } catch (error) {
    if (active !== table) return
    console.warn('Could not load the shareholder data', error)
    elements.year.disabled = false
    renderError(table, `${info.label}数据加载失败，请稍后重试。`)
    status('数据加载失败。')
  }
}

async function openLinkedStock(table: ActiveTable, code: string): Promise<void> {
  const company = findCompany(table, code)
  if (!company || !table.payload) return
  const lastIndex = company.r.reduce((index, row, rowIndex) => (row ? rowIndex : index), -1)
  if (lastIndex < 0) return
  const year = table.payload.years[lastIndex]

  if (year !== table.year) {
    table.year = year
    selectedYears.set(table.market, year)
    table.rows = buildRows(table, year)
    const columnsChanged = setColumns(table)
    table.visible = filteredRows(table)
    elements.year.value = String(year)
    if (columnsChanged) renderHeader(table)
    updateCaption(table)
    updateCount(table)
    lastSignature = ''
    renderWindow(true)
  }

  const rowIndex = table.visible.findIndex((row) => row.code === code)
  if (rowIndex >= 0) openDetail(table, rowIndex, false)
}

function switchMarket(market: Market): void {
  if (active?.market === market) return
  const url = new URL(window.location.href)
  if (url.searchParams.has('stock')) {
    url.searchParams.delete('stock')
    window.history.replaceState(null, '', url)
  }
  void activate(market)
}

/* ------------------------------------------------------------------ */
/* Wiring                                                              */
/* ------------------------------------------------------------------ */

function init(): void {
  const root = document.querySelector<HTMLElement>('[data-holder-table]')
  if (!root || root.dataset.ready === 'true') return

  const viewport = root.querySelector<HTMLElement>('[data-holder-viewport]')
  const head = root.querySelector<HTMLTableSectionElement>('[data-holder-head]')
  const body = root.querySelector<HTMLTableSectionElement>('[data-holder-body]')
  const search = root.querySelector<HTMLInputElement>('#holder-search')
  const year = root.querySelector<HTMLSelectElement>('[data-holder-year]')
  const count = root.querySelector<HTMLElement>('[data-holder-count]')
  const caption = root.querySelector<HTMLElement>('[data-holder-caption]')
  const statusElement = root.querySelector<HTMLElement>('[data-holder-status]')
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-market]')]
  const marketsJson = root.dataset.markets

  if (
    !viewport ||
    !head ||
    !body ||
    !search ||
    !year ||
    !count ||
    !caption ||
    !statusElement ||
    tabs.length === 0 ||
    !marketsJson
  ) {
    return
  }

  let parsed: MarketInfo[]
  try {
    parsed = JSON.parse(marketsJson) as MarketInfo[]
  } catch (error) {
    console.warn('Invalid shareholder market payload', error)
    return
  }
  infos = Object.fromEntries(parsed.map((market) => [market.id, market])) as Record<Market, MarketInfo>
  active = null
  lastSignature = ''

  elements = { root, viewport, head, body, search, year, count, caption, status: statusElement, tabs }

  search.addEventListener('input', () => {
    if (active) applySearch(active)
  })

  search.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || !active) return
    if (active.visible.length === 1) {
      event.preventDefault()
      openDetail(active, 0, true)
    }
  })

  year.addEventListener('change', () => {
    if (active) applyYear(active, Number(year.value))
  })

  for (const tab of tabs) {
    tab.addEventListener('click', () => switchMarket(tab.dataset.market as Market))
    const warm = () => {
      const market = tab.dataset.market as Market
      if (!payloads.has(market)) {
        void loadPayload(infos[market]).catch((error) => {
          console.warn(`Could not warm the ${market} shareholder data`, error)
        })
      }
    }
    tab.addEventListener('pointerenter', warm, { once: true })
    tab.addEventListener('focus', warm, { once: true })
  }

  head.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element) || !active) return
    const button = target.closest<HTMLButtonElement>('[data-sort]')
    if (button?.dataset.sort) applySort(active, button.dataset.sort)
  })

  body.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element) || !active) return
    if (target.closest('[data-close-detail]')) {
      closeDetail(active, true, keyboardMode)
      return
    }
    const row = target.closest<HTMLTableRowElement>('tr.holder-row')
    if (!row || target.closest('a, input, select, textarea')) return
    const index = active.visible.findIndex((entry) => entry.code === row.dataset.code)
    if (index >= 0) openDetail(active, index, keyboardMode)
  })

  root.addEventListener('click', (event) => {
    const target = event.target
    if (target instanceof Element && target.closest('[data-retry]') && active) {
      void activate(active.market, { year: active.year })
    }
  })

  root.addEventListener('pointerdown', () => {
    keyboardMode = false
  })
  root.addEventListener('keydown', () => {
    keyboardMode = true
  }, true)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && active && active.openIndex !== null) {
      event.preventDefault()
      const table = active
      const openIndex = table.openIndex
      if (openIndex === null) return
      const code = table.visible[openIndex]?.code ?? null
      closeDetail(table, true, false)
      if (code) focusRow(table, code)
    }
  })

  viewport.addEventListener('scroll', scheduleRender, { passive: true })

  const resizeObserver = new ResizeObserver(() => {
    lastSignature = ''
    if (active?.detailCell) active.detailCell.colSpan = visibleColumnCount()
    renderWindow(true)
    if (active) measureDetail(active)
  })
  resizeObserver.observe(viewport)

  root.dataset.ready = 'true'

  const url = new URL(window.location.href)
  const requestedMarket = url.searchParams.get('market')
  const requestedStock = url.searchParams.get('stock')?.replace(/\D/g, '').padStart(6, '0') ?? ''
  let startMarket: Market = requestedMarket === 'szse' ? 'szse' : root.dataset.defaultMarket === 'szse' ? 'szse' : 'sse'
  if (requestedStock) {
    if (requestedStock.startsWith('6') || requestedStock.startsWith('9')) startMarket = 'sse'
    else if (requestedStock.startsWith('0') || requestedStock.startsWith('3')) startMarket = 'szse'
  }

  // Reuse the server header's keys for the first loading state, so a hidden
  // residual column does not flash in and out before the payload arrives.
  const headerKeys = [...head.querySelectorAll<HTMLTableCellElement>('th[data-sort-th]')].map(
    (cell) => cell.dataset.sortTh,
  )
  const baseStartColumns = columnsForMarket(startMarket)
  const startColumns = baseStartColumns.filter((column) => headerKeys.includes(column.key))
  const columns = startColumns.length >= baseStartColumns.length - 1 ? startColumns : undefined

  void activate(startMarket, { code: requestedStock || undefined, columns, initial: true })
}

init()
document.addEventListener('astro:after-swap', init)
