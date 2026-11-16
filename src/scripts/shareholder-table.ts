import type { Board, ClientCompany, ClientPayload } from '../lib/shareholders/types'
import {
  HISTORY_KEYS,
  HISTORY_LABELS,
  NUMERIC_SORT_KEYS,
  SORT_LABELS,
  buildHistory,
  boardLabel,
  clientTableRows,
  companyNameAt,
  compareForSort,
  escapeHtml,
  historyAriaLabel,
  historyLatest,
  historyPath,
  historySummary,
  historyX,
  historyY,
  lastPoint,
  matchesTableRow,
  normalizeQuery,
  sortTableRows,
  tableEmptyRowHtml,
  tableRowHtml,
  type History,
  type HistoryKey,
  type HistoryPoint,
  type SortKey,
  type TableRow,
} from '../lib/shareholders/table'
import { formatCount, formatPercent, formatShares } from '../lib/shareholders/view'

/**
 * The shareholder table's browser side: search, column sort, the year switch and
 * the one open accordion. The latest year is already in the HTML, so the table is
 * readable before this file runs; the full history is fetched in the background
 * and only blocks the first year switch or accordion if it has not arrived yet.
 */

interface Elements {
  root: HTMLElement
  toolbar: HTMLElement
  hint: HTMLElement
  input: HTMLInputElement
  year: HTMLSelectElement
  count: HTMLElement
  caption: HTMLElement | null
  body: HTMLElement
  empty: HTMLElement | null
  status: HTMLElement
  endpoint: string
}

interface State {
  payload: ClientPayload | null
  loading: Promise<ClientPayload> | null
  key: SortKey
  direction: 'asc' | 'desc'
  year: number
  query: string
  openRow: HTMLTableRowElement | null
  openDetail: HTMLTableRowElement | null
  openToken: number
}

const READOUT = (point: HistoryPoint): string =>
  `${point.year} 年末 · 自然人 ${formatPercent(point.individual)} · 一般法人 ${formatPercent(
    point.corporate,
  )} · 专业机构 ${formatPercent(point.institution)} · 其他 ${formatPercent(point.other, 2)}`

/* ------------------------------------------------------------------ */
/* Payload                                                             */
/* ------------------------------------------------------------------ */

function loadPayload(elements: Elements, state: State): Promise<ClientPayload> {
  if (state.payload) return Promise.resolve(state.payload)
  if (!state.loading) {
    state.loading = fetch(elements.endpoint, { headers: { accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<ClientPayload>
      })
      .then((payload) => {
        state.payload = payload
        return payload
      })
      .finally(() => {
        state.loading = null
      })
  }

  return state.loading
}

function prefetch(elements: Elements, state: State): void {
  window.setTimeout(() => {
    void loadPayload(elements, state).catch((error) => {
      console.warn('Could not prefetch the shareholder panel data', error)
    })
  }, 1200)
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

function rowValue(row: HTMLTableRowElement): TableRow {
  return {
    code: row.dataset.code ?? '',
    name: row.dataset.name ?? '',
    board: row.dataset.board as Board,
    aliases: row.dataset.aliases ? row.dataset.aliases.split('|') : [],
    totalYi: Number(row.dataset.total ?? 0),
    individual: Number(row.dataset.individual ?? 0),
    corporate: Number(row.dataset.corporate ?? 0),
    institution: Number(row.dataset.institution ?? 0),
    other: Number(row.dataset.other ?? 0),
  }
}

function sortDom(elements: Elements, state: State): void {
  const entries = [...elements.body.querySelectorAll<HTMLTableRowElement>('tr.holder-row')].map((row) => ({
    row,
    value: rowValue(row),
  }))
  entries.sort((first, second) => compareForSort(first.value, second.value, state.key, state.direction))

  const fragment = document.createDocumentFragment()
  for (const entry of entries) fragment.append(entry.row)
  elements.body.insertBefore(fragment, elements.empty)
}

function updateSortHeader(root: HTMLElement, state: State): void {
  for (const cell of root.querySelectorAll<HTMLTableCellElement>('th[data-sort-th]')) {
    const key = cell.dataset.sortTh as SortKey
    const active = key === state.key
    const ascending = state.direction === 'asc'
    cell.setAttribute('aria-sort', active ? (ascending ? 'ascending' : 'descending') : 'none')

    const mark = cell.querySelector<HTMLElement>('[data-sort-mark]')
    if (mark) mark.textContent = active ? (ascending ? '↑' : '↓') : ''

    const button = cell.querySelector<HTMLButtonElement>('[data-sort]')
    if (button) button.setAttribute('aria-label', `按${SORT_LABELS[key]}排序`)
  }
}

function updateCaption(elements: Elements, year: number): void {
  if (!elements.caption) return
  elements.caption.textContent = `${year} 年末个股股东持股结构表。列有自然人、一般法人、专业机构、其他持股比例与合计持股数；各列可按升序或降序排列。`
}

function applyFilter(elements: Elements, state: State): void {
  const query = normalizeQuery(state.query)
  const rows = [...elements.body.querySelectorAll<HTMLTableRowElement>('tr.holder-row')]
  let visible = 0

  for (const row of rows) {
    const match = matchesTableRow(rowValue(row), query)
    row.hidden = !match
    if (match) visible += 1
  }

  elements.count.textContent =
    query === '' ? formatCount(rows.length) : `${formatCount(visible)} / ${formatCount(rows.length)}`
  if (elements.empty) elements.empty.hidden = visible !== 0
}

function renderYear(elements: Elements, state: State, payload: ClientPayload, year: number): void {
  const rows = sortTableRows(clientTableRows(payload, year), state.key, state.direction)
  elements.body.innerHTML = rows.map(tableRowHtml).join('') + tableEmptyRowHtml()
  elements.empty = elements.body.querySelector<HTMLElement>('[data-holder-empty]')
  updateCaption(elements, year)
  applyFilter(elements, state)
}

function findRow(elements: Elements, code: string): HTMLTableRowElement | null {
  return elements.body.querySelector<HTMLTableRowElement>(`tr.holder-row[data-code="${code}"]`)
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

/* ------------------------------------------------------------------ */
/* Accordion                                                           */
/* ------------------------------------------------------------------ */

function closeDetail(state: State): void {
  if (!state.openRow && !state.openDetail) return

  state.openToken += 1
  const button = state.openRow?.querySelector<HTMLButtonElement>('[data-row-toggle]')
  button?.setAttribute('aria-expanded', 'false')
  button?.removeAttribute('aria-controls')
  state.openRow?.classList.remove('is-open')
  state.openDetail?.remove()
  state.openRow = null
  state.openDetail = null
  setStockParam(null)
}

function chartDots(history: History): string {
  return HISTORY_KEYS.map((key) => {
    const point = historyLatest(history, key)
    if (!point) return ''
    return `<span class="holder-chart__dot holder-chart__dot--${key}" data-dot="${key}" aria-hidden="true" style="left:${historyX(
      point.index,
      history.length,
    )}%;top:${historyY(point.value)}%"></span>`
  }).join('')
}

function chartHtml(company: ClientCompany, name: string, years: number[], history: History): string {
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

  const legend = HISTORY_KEYS.map((key) => {
    const latest = historyLatest(history, key)
    return `<li><span class="holder-chart__swatch holder-chart__swatch--${key}" aria-hidden="true"></span>${HISTORY_LABELS[key]}<b>${
      latest ? formatPercent(latest.value) : '—'
    }</b></li>`
  }).join('')

  const notes: string[] = ['比例为占当年合计持股，合计单位为亿股。', '在图上移动可查看单年数值。']
  if (breaks.length > 0) {
    notes.push(
      `虚线：${breakYears.map((year) => (year === 2009 ? '2009 年合计口径' : '2022 年分类调整')).join('、')}。`,
    )
  }
  if (history.some((entry) => entry === null)) notes.push('折线断开处表示该年末未收录。')
  if (company.b === 'B股') {
    notes.push('B 股仅部分年份收录；2013 年末的记录全部记为自然人 100%，疑为原始表退化。')
  }

  const readout = point ? READOUT(point) : '—'
  const aria = historyAriaLabel(name, history)

  return `<figure class="holder-chart">
  <div class="holder-chart__body">
    <div class="holder-chart__yaxis" aria-hidden="true">
      <span style="top:0%">100%</span>
      <span style="top:25%">75%</span>
      <span style="top:50%">50%</span>
      <span style="top:75%">25%</span>
      <span style="top:100%">0%</span>
    </div>
    <div class="holder-chart__plot" data-chart-plot>
      <svg class="holder-chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="${escapeHtml(aria)}">
        ${grids}
        ${breaks}
        ${paths}
      </svg>
      <span class="holder-chart__crosshair" data-crosshair hidden></span>
      ${chartDots(history)}
    </div>
  </div>
  <div class="holder-chart__years" style="grid-template-columns:repeat(${years.length}, minmax(0, 1fr))" aria-hidden="true">
    ${years.map((year) => `<span>${year}</span>`).join('')}
  </div>
  <figcaption class="holder-chart__caption">
    <ul class="holder-chart__legend">${legend}</ul>
    <p class="holder-chart__readout" data-readout>${readout}</p>
    <p class="holder-chart__note">${notes.join(' ')}</p>
  </figcaption>
</figure>`
}

function bindChart(container: HTMLElement, history: History, years: number[]): void {
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
    readout.textContent = latest ? READOUT(latest) : '—'
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
    readout.textContent = READOUT(point)
  })

  plot.addEventListener('pointerleave', reset)
}

function yearTable(history: History): string {
  const rows = history
    .filter((point): point is HistoryPoint => point !== null)
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
    <summary class="holder-years__summary"><span>逐年数据</span><span class="holder-years__count">${
      history.filter((point) => point !== null).length
    } 年</span></summary>
    <div class="holder-years__wrap">
      <table class="holder-years__table">
        <caption class="sr-only">各年末的合计持股与四类股东持股比例。</caption>
        <thead><tr><th scope="col">年末</th><th scope="col">合计</th><th scope="col">自然人</th><th scope="col">一般法人</th><th scope="col">专业机构</th><th scope="col">其他</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </details>`
}

function renderDetail(
  cell: HTMLTableCellElement,
  company: ClientCompany,
  payload: ClientPayload,
  state: State,
): void {
  const history = buildHistory(company, payload.years)
  const point = lastPoint(history)
  const first = history.find((entry): entry is HistoryPoint => entry !== null)
  if (!point || !first) {
    cell.innerHTML = '<div class="holder-detail" role="region"><p class="holder-detail__error" role="alert">没有可展示的历史记录。</p></div>'
    return
  }

  const name = companyNameAt(company, state.year)
  const latestYear = payload.years.at(-1)!
  const firstIndex = history.findIndex((entry) => entry !== null)
  const lastIndex = history.reduce((index, entry, rowIndex) => (entry ? rowIndex : index), -1)
  const chartYears = payload.years.slice(firstIndex, lastIndex + 1)
  const chartHistory = history.slice(firstIndex, lastIndex + 1)
  const renamed = company.n !== name
  const delisted = point.year < latestYear
  const titleId = `holder-detail-title-${company.c}`
  const meta = [boardLabel(company.b), `${first.year}–${point.year} 年末`]
  if (renamed) meta.push(`现名 ${company.n}`)
  if (delisted) meta.push(`最后收录 ${point.year} 年末`)

  cell.innerHTML = `<div class="holder-detail" role="region" aria-labelledby="${titleId}">
    <header class="holder-detail__head">
      <div class="holder-detail__identity">
        <p class="holder-detail__kicker">${meta.map(escapeHtml).join(' · ')}</p>
        <h3 class="holder-detail__title" id="${titleId}">${escapeHtml(name)}<span class="holder-detail__code">${company.c}</span></h3>
      </div>
      <button type="button" class="holder-detail__close" data-close-detail aria-label="收起 ${escapeHtml(name)} 的历年数据">收起 <span aria-hidden="true">×</span></button>
    </header>
    <p class="holder-detail__summary">${historySummary(history)}</p>
    ${chartHtml(company, name, chartYears, chartHistory)}
    ${yearTable(history)}
  </div>`

  bindChart(cell, chartHistory, chartYears)
}

async function openRow(elements: Elements, state: State, row: HTMLTableRowElement, scroll = false): Promise<void> {
  if (state.openRow === row) {
    closeDetail(state)
    return
  }

  closeDetail(state)
  const code = row.dataset.code
  if (!code) return

  const token = state.openToken + 1
  state.openToken = token
  state.openRow = row
  row.classList.add('is-open')

  const button = row.querySelector<HTMLButtonElement>('[data-row-toggle]')
  button?.setAttribute('aria-expanded', 'true')

  const detail = document.createElement('tr')
  detail.className = 'holder-detail-row'
  detail.id = `holder-detail-${code}`
  const cell = document.createElement('td')
  cell.className = 'holder-detail-cell'
  cell.colSpan = 8
  cell.innerHTML = `<div class="holder-detail" role="region" aria-label="正在载入 ${escapeHtml(
    row.dataset.name ?? code,
  )} 的历年数据"><p class="holder-detail__loading">正在载入 ${escapeHtml(
    row.dataset.name ?? code,
  )} 的历年数据…</p></div>`
  detail.append(cell)
  row.after(detail)
  button?.setAttribute('aria-controls', detail.id)

  state.openDetail = detail
  setStockParam(code)
  if (scroll) row.scrollIntoView({ block: 'center' })

  try {
    const payload = await loadPayload(elements, state)
    if (state.openToken !== token || state.openRow !== row) return
    const company = payload.companies.find((entry) => entry.c === code)
    if (!company) throw new Error(`No company ${code}`)
    renderDetail(cell, company, payload, state)
    if (scroll) detail.scrollIntoView({ block: 'nearest' })
  } catch (error) {
    if (state.openToken !== token || state.openRow !== row) return
    console.warn('Could not load the stock history', error)
    cell.innerHTML =
      '<div class="holder-detail" role="region"><p class="holder-detail__error" role="alert">历年数据加载失败，请刷新页面后重试。</p></div>'
  }
}

/* ------------------------------------------------------------------ */
/* Wiring                                                              */
/* ------------------------------------------------------------------ */

function init(): void {
  const root = document.querySelector<HTMLElement>('[data-holder-table]')
  if (!root || root.dataset.ready === 'true') return

  const toolbar = root.querySelector<HTMLElement>('[data-holder-toolbar]')
  const hint = root.querySelector<HTMLElement>('[data-holder-hint]')
  const input = root.querySelector<HTMLInputElement>('#holder-search')
  const year = root.querySelector<HTMLSelectElement>('[data-holder-year]')
  const count = root.querySelector<HTMLElement>('[data-holder-count]')
  const body = root.querySelector<HTMLElement>('[data-holder-body]')
  const status = root.querySelector<HTMLElement>('[data-holder-status]')
  const caption = root.querySelector<HTMLElement>('[data-holder-caption]')
  const endpoint = root.dataset.endpoint

  if (!toolbar || !hint || !input || !year || !count || !body || !status || !endpoint) return

  const elements: Elements = {
    root,
    toolbar,
    hint,
    input,
    year,
    count,
    caption,
    body,
    empty: body.querySelector<HTMLElement>('[data-holder-empty]'),
    status,
    endpoint,
  }
  const state: State = {
    payload: null,
    loading: null,
    key: 'code',
    direction: 'asc',
    year: Number(root.dataset.latestYear),
    query: '',
    openRow: null,
    openDetail: null,
    openToken: 0,
  }

  elements.toolbar.hidden = false
  elements.hint.hidden = false
  updateSortHeader(root, state)
  updateCaption(elements, state.year)
  applyFilter(elements, state)

  input.addEventListener('input', () => {
    closeDetail(state)
    state.query = input.value
    applyFilter(elements, state)
  })

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return
    const visible = [...body.querySelectorAll<HTMLTableRowElement>('tr.holder-row')].filter((row) => !row.hidden)
    if (visible.length === 1) {
      event.preventDefault()
      void openRow(elements, state, visible[0])
    }
  })

  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-sort]')) {
    button.addEventListener('click', () => {
      const key = button.dataset.sort as SortKey
      if (state.key === key) state.direction = state.direction === 'asc' ? 'desc' : 'asc'
      else {
        state.key = key
        state.direction = NUMERIC_SORT_KEYS.includes(key) ? 'desc' : 'asc'
      }

      closeDetail(state)
      sortDom(elements, state)
      updateSortHeader(root, state)
      elements.status.textContent = `已按${SORT_LABELS[key]}${state.direction === 'asc' ? '升序' : '降序'}排列。`
    })
  }

  year.addEventListener('change', async () => {
    const next = Number(year.value)
    if (!Number.isFinite(next) || next === state.year) return

    const previous = state.year
    closeDetail(state)
    year.disabled = true
    elements.status.textContent = `正在载入 ${next} 年末数据…`

    try {
      const payload = await loadPayload(elements, state)
      state.year = next
      renderYear(elements, state, payload, next)
      elements.status.textContent = `已显示 ${next} 年末，共 ${formatCount(
        body.querySelectorAll('tr.holder-row').length,
      )} 只。`
    } catch (error) {
      console.warn('Could not switch the shareholder table year', error)
      year.value = String(previous)
      elements.status.textContent = '数据加载失败，请稍后重试。'
    } finally {
      year.disabled = false
    }
  })

  root.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    if (target.closest('[data-close-detail]')) {
      closeDetail(state)
      return
    }

    const row = target.closest<HTMLTableRowElement>('tr.holder-row')
    if (!row) return
    if (target.closest('a, input, select, textarea')) return
    void openRow(elements, state, row)
  })

  const requested = new URL(window.location.href).searchParams.get('stock')
  if (requested) {
    const code = requested.replace(/\D/g, '').padStart(6, '0')
    if (/^\d{6}$/.test(code)) {
      void (async () => {
        try {
          const payload = await loadPayload(elements, state)
          const company = payload.companies.find((entry) => entry.c === code)
          const lastIndex = company?.r.reduce((index, row, rowIndex) => (row ? rowIndex : index), -1) ?? -1
          if (!company || lastIndex < 0) return

          const yearOfRow = payload.years[lastIndex]
          if (yearOfRow !== state.year) {
            state.year = yearOfRow
            elements.year.value = String(yearOfRow)
            renderYear(elements, state, payload, yearOfRow)
          }

          const row = findRow(elements, code)
          if (row) void openRow(elements, state, row, true)
        } catch (error) {
          console.warn('Could not open the linked stock', error)
        }
      })()
    }
  }

  prefetch(elements, state)
  root.dataset.ready = 'true'
}

init()
document.addEventListener('astro:after-swap', init)
