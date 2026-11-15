import { decodeCompactStats } from '../lib/shareholders/client-data'
import type {
  BoardKey,
  ClientCompany,
  ClientPayload,
  CompactStats,
  MarketSeries,
} from '../lib/shareholders/types'
import {
  annualTableRows,
  formatCount,
  formatDelta,
  formatPercent,
  formatRange,
  formatShares,
  marketChartGeometry,
  marketChartLabel,
  marketSummary,
  rankOf,
  yearX,
} from '../lib/shareholders/view'

/**
 * The shareholder panel's browser side: the board filter on the market chart, the
 * hover readout, and the stock lookup. Everything works from two payloads — the
 * market series inlined in the page and `panel.json` fetched on first use.
 */

const BOARD_LABELS: Record<BoardKey, string> = {
  all: '全部',
  主板A: '主板 A 股',
  科创板: '科创板',
  B股: 'B 股',
}

const BOARD_TAG: Record<string, string> = {
  主板A: '主板 A',
  科创板: '科创板',
  B股: 'B 股',
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* ------------------------------------------------------------------ */
/* Market chart                                                        */
/* ------------------------------------------------------------------ */

interface MarketElements {
  root: HTMLElement
  years: number[]
  series: Record<BoardKey, MarketSeries>
  latestYear: number
  svg: SVGSVGElement
  band: SVGPathElement
  median: SVGPathElement
  weighted: SVGPathElement
  tableBody: HTMLElement
  readout: HTMLElement
  live: HTMLElement
  plot: HTMLElement
  crosshair: HTMLElement
  dotMedian: HTMLElement
  dotWeighted: HTMLElement
  markers: { key: string; elements: Element[] }[]
  radios: HTMLInputElement[]
}

const liveString = (series: MarketSeries, key: BoardKey) => marketSummary(series, BOARD_LABELS[key])

function setHoverVisible(elements: MarketElements, visible: boolean): void {
  elements.crosshair.hidden = !visible
  elements.dotMedian.hidden = !visible
  elements.dotWeighted.hidden = !visible
}

function resetReadout(elements: MarketElements, key: BoardKey): void {
  elements.readout.textContent = liveString(elements.series[key], key)
}

function renderMarket(elements: MarketElements, key: BoardKey): void {
  const series = elements.series[key]
  const geometry = marketChartGeometry(series)

  elements.band.setAttribute('d', geometry.band)
  elements.median.setAttribute('d', geometry.median)
  elements.weighted.setAttribute('d', geometry.weighted)
  elements.tableBody.innerHTML = annualTableRows(elements.years, series, elements.latestYear)
  elements.svg.setAttribute('aria-label', marketChartLabel(series, BOARD_LABELS[key]))
  elements.live.textContent = liveString(series, key)
  setHoverVisible(elements, false)
  resetReadout(elements, key)

  const hasPre2009 = series.some((point) => point !== null && point.year <= 2009)
  for (const marker of elements.markers) {
    const hidden = marker.key === '2009' ? !hasPre2009 : marker.key === 'degenerate' ? key !== 'B股' : false
    for (const element of marker.elements) element.toggleAttribute('data-hidden', hidden)
  }
}

function showPoint(elements: MarketElements, key: BoardKey, index: number): void {
  const point = elements.series[key][index]
  if (!point) {
    setHoverVisible(elements, false)
    resetReadout(elements, key)
    return
  }

  const x = yearX(index, elements.years.length)
  elements.crosshair.style.left = `${x}%`
  elements.dotMedian.style.left = `${x}%`
  elements.dotMedian.style.top = `${100 - point.median}%`
  elements.dotWeighted.style.left = `${x}%`
  elements.dotWeighted.style.top = `${100 - point.weightedIndividual}%`
  setHoverVisible(elements, true)
  elements.readout.innerHTML = `${point.year} 年末 · <strong>中位 ${formatPercent(point.median)}</strong> · 加权 <strong>${formatPercent(
    point.weightedIndividual,
  )}</strong> · P25–P75 ${formatRange(point.p25, point.p75)}% · ${formatCount(point.count)} 只`
}

function initMarket(): void {
  const root = document.querySelector<HTMLElement>('[data-market-chart]')
  if (!root || root.dataset.ready === 'true') return

  const statsScript = root.querySelector<HTMLScriptElement>('[data-market-stats]')
  const svg = root.querySelector<SVGSVGElement>('[data-market-svg]')
  const plot = root.querySelector<HTMLElement>('[data-market-plot]')
  const band = root.querySelector<SVGPathElement>('[data-market-band]')
  const median = root.querySelector<SVGPathElement>('[data-market-median]')
  const weighted = root.querySelector<SVGPathElement>('[data-market-weighted]')
  const tableBody = root.querySelector<HTMLElement>('[data-market-table-body]')
  const readout = root.querySelector<HTMLElement>('[data-market-readout]')
  const live = root.querySelector<HTMLElement>('[data-market-live]')
  const crosshair = root.querySelector<HTMLElement>('[data-market-crosshair]')
  const dotMedian = root.querySelector<HTMLElement>('[data-market-dot="median"]')
  const dotWeighted = root.querySelector<HTMLElement>('[data-market-dot="weighted"]')
  const radios = [...root.querySelectorAll<HTMLInputElement>('input[name="market-board"]')]

  if (
    !statsScript?.textContent ||
    !svg ||
    !plot ||
    !band ||
    !median ||
    !weighted ||
    !tableBody ||
    !readout ||
    !live ||
    !crosshair ||
    !dotMedian ||
    !dotWeighted ||
    radios.length === 0
  ) return

  let compact: CompactStats
  try {
    compact = JSON.parse(statsScript.textContent) as CompactStats
  } catch (error) {
    console.warn('Invalid shareholder market payload', error)
    return
  }

  const elements: MarketElements = {
    root,
    years: compact.years,
    series: decodeCompactStats(compact),
    latestYear: Number(root.dataset.latestYear),
    svg,
    band,
    median,
    weighted,
    tableBody,
    readout,
    live,
    plot,
    crosshair,
    dotMedian,
    dotWeighted,
    markers: ['2009', 'degenerate', '2022'].map((key) => ({
      key,
      elements: [
        ...root.querySelectorAll(`[data-market-marker="${key}"], [data-market-marker-label="${key}"]`),
      ],
    })),
    radios,
  }

  let currentKey: BoardKey = (radios.find((radio) => radio.checked)?.value as BoardKey) ?? 'all'

  for (const radio of radios) {
    radio.addEventListener('change', () => {
      if (!radio.checked) return
      currentKey = radio.value as BoardKey
      renderMarket(elements, currentKey)
    })
  }

  plot.addEventListener('pointermove', (event) => {
    const rect = plot.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = (event.clientX - rect.left) / rect.width
    if (ratio < 0 || ratio > 1) {
      setHoverVisible(elements, false)
      resetReadout(elements, currentKey)
      return
    }
    const index = Math.min(elements.years.length - 1, Math.max(0, Math.floor(ratio * elements.years.length)))
    showPoint(elements, currentKey, index)
  })

  plot.addEventListener('pointerleave', () => {
    setHoverVisible(elements, false)
    resetReadout(elements, currentKey)
  })

  root.dataset.ready = 'true'
}

/* ------------------------------------------------------------------ */
/* Stock lookup                                                        */
/* ------------------------------------------------------------------ */

interface LookupElements {
  root: HTMLElement
  endpoint: string
  latestYear: number
  input: HTMLInputElement
  results: HTMLUListElement
  hint: HTMLElement
  message: HTMLElement
  status: HTMLElement
  detail: HTMLElement
  quickLinks: HTMLAnchorElement[]
}

interface LookupState {
  payload: ClientPayload | null
  loading: Promise<ClientPayload> | null
  matches: ClientCompany[]
  selected: number
  current: ClientCompany | null
  yearRanking: number[][] | null
}

function yearRanking(payload: ClientPayload): number[][] {
  return payload.years.map((_, index) =>
    payload.companies
      .map((company) => company.r[index])
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .map((row) => row[1]),
  )
}

function searchCompanies(payload: ClientPayload, query: string): ClientCompany[] {
  const text = query.trim()
  if (text === '') return []

  const isCode = /^\d+$/.test(text)
  const name = text.toLowerCase()
  const matches: { company: ClientCompany; score: number }[] = []

  for (const company of payload.companies) {
    const names = [company.n, ...(company.a ?? [])]
    let score = -1

    if (isCode) {
      if (company.c === text.padStart(6, '0')) score = 0
      else if (company.c.startsWith(text)) score = 1
      else if (company.c.startsWith(text.padStart(6, '0'))) score = 1
    } else if (names.some((entry) => entry.toLowerCase() === name)) {
      score = 2
    } else if (names.some((entry) => entry.toLowerCase().includes(name))) {
      score = 3
    }

    if (score >= 0) matches.push({ company, score })
  }

  matches.sort((a, b) => a.score - b.score || a.company.c.localeCompare(b.company.c))
  return matches.slice(0, 8).map((match) => match.company)
}

function closeResults(elements: LookupElements, state: LookupState): void {
  elements.results.hidden = true
  elements.results.replaceChildren()
  elements.input.setAttribute('aria-expanded', 'false')
  elements.input.removeAttribute('aria-activedescendant')
  state.matches = []
  state.selected = -1
}

function renderResults(elements: LookupElements, state: LookupState, query: string): void {
  const payload = state.payload
  if (!payload) return

  state.matches = searchCompanies(payload, query)
  state.selected = state.matches.length > 0 ? 0 : -1
  elements.results.replaceChildren()

  if (query.trim() === '') {
    closeResults(elements, state)
    return
  }

  if (state.matches.length === 0) {
    const empty = document.createElement('li')
    empty.className = 'stock-results__empty'
    empty.textContent = '没有匹配的股票，试试完整代码或简称。'
    elements.results.append(empty)
    elements.results.hidden = false
    elements.input.setAttribute('aria-expanded', 'true')
    elements.input.removeAttribute('aria-activedescendant')
    return
  }

  state.matches.forEach((company, index) => {
    const option = document.createElement('li')
    option.className = 'stock-results__item'
    option.id = `stock-option-${index}`
    option.dataset.code = company.c
    option.setAttribute('role', 'option')
    option.setAttribute('aria-selected', String(index === state.selected))

    const name = document.createElement('span')
    name.className = 'stock-results__name'
    name.textContent = company.n

    const code = document.createElement('span')
    code.className = 'stock-results__code'
    code.textContent = company.c

    const board = document.createElement('span')
    board.className = 'stock-results__board'
    board.textContent = BOARD_TAG[company.b] ?? company.b

    option.append(name, code, board)
    option.addEventListener('click', () => {
      selectCompany(elements, state, company)
    })
    elements.results.append(option)
  })

  elements.results.hidden = false
  elements.input.setAttribute('aria-expanded', 'true')
  const first = elements.results.querySelector<HTMLElement>('[role="option"]')
  if (first) elements.input.setAttribute('aria-activedescendant', first.id)
}

function setSelected(elements: LookupElements, state: LookupState, index: number): void {
  if (state.matches.length === 0) return
  state.selected = (index + state.matches.length) % state.matches.length
  const options = elements.results.querySelectorAll<HTMLElement>('[role="option"]')
  options.forEach((option, optionIndex) => {
    option.setAttribute('aria-selected', String(optionIndex === state.selected))
  })
  const current = options[state.selected]
  if (current) elements.input.setAttribute('aria-activedescendant', current.id)
}

function compositionBars(payload: ClientPayload, company: ClientCompany): string {
  return payload.years
    .map((year, index) => {
      const row = company.r[index]
      if (!row) return '<span class="stock-composition__empty"></span>'

      const [, individual, corporate, institution, other] = row
      return `<div class="stock-composition__column" data-year="${year}">
        <span class="stock-composition__seg stock-composition__seg--individual" style="height:${individual}%"></span>
        <span class="stock-composition__seg stock-composition__seg--corporate" style="height:${corporate}%"></span>
        <span class="stock-composition__seg stock-composition__seg--institution" style="height:${institution}%"></span>
        <span class="stock-composition__seg stock-composition__seg--other" style="height:${Math.max(0, other)}%"></span>
      </div>`
    })
    .join('')
}

function yearsTable(payload: ClientPayload, company: ClientCompany): string {
  return payload.years
    .map((year, index) => {
      const row = company.r[index]
      if (!row) return ''
      const [totalYi, individual, corporate, institution, other] = row
      return `<tr>
        <th scope="row" class="panel-table__year"><span class="panel-table__year-number">${year}</span><span class="panel-table__year-edition">${year + 1} 卷</span></th>
        <td>${formatShares(totalYi * 1e4)}</td>
        <td>${formatPercent(individual)}</td>
        <td>${formatPercent(corporate)}</td>
        <td>${formatPercent(institution)}</td>
        <td class="panel-table__count">${formatPercent(other, 2)}</td>
      </tr>`
    })
    .join('')
}

function renderDetail(elements: LookupElements, state: LookupState, company: ClientCompany): void {
  const payload = state.payload
  if (!payload) return

  // A delisted stock stops at its last listed year, not necessarily at the latest one.
  const latestIndex = company.r.reduce((last, row, index) => (row ? index : last), -1)
  const latestRow = latestIndex >= 0 ? company.r[latestIndex] : null
  if (!latestRow) {
    showError(elements, '这只股票没有可展示的年度记录。')
    return
  }

  const latestYear = payload.years[latestIndex]
  const previous = [...company.r.slice(0, latestIndex)].reverse().find((row) => row !== null)
  const [, individual, corporate, institution] = latestRow
  const ranking = state.yearRanking?.[latestIndex] ?? []
  const { rank, count } = rankOf(ranking, individual)
  const delta = previous ? individual - previous[1] : null

  const facts = [
    {
      label: `${latestYear} 年末 自然人`,
      value: formatPercent(individual),
      sub: `第 ${formatCount(rank)} / ${formatCount(count)} 位`,
    },
    { label: '一般法人', value: formatPercent(corporate) },
    { label: '专业机构', value: formatPercent(institution) },
    { label: '合计持股', value: formatShares(latestRow[0] * 1e4) },
  ]

  const firstYear = payload.years.find((_, index) => company.r[index] !== null) ?? latestYear
  const compositionLabel = `持股构成：自然人、一般法人、专业机构、其他按年末堆叠，${firstYear}—${latestYear} 年。`
  const delisted = latestYear < payload.years[payload.years.length - 1]

  elements.detail.innerHTML = `
    <p class="stock-detail__kicker">个股 · ${firstYear}—${latestYear} 年末</p>
    <div class="stock-detail__head">
      <h3 id="stock-detail-name" class="stock-detail__name">${escapeHtml(company.n)}</h3>
      <span class="stock-detail__code">${company.c}</span>
      <span class="stock-detail__meta">${BOARD_TAG[company.b] ?? company.b} · ${latestYear} 年末</span>
    </div>

    <dl class="stock-facts">
      ${facts
        .map(
          (fact) => `<div class="stock-facts__item"><dt>${fact.label}</dt><dd>${fact.value}${
            fact.sub ? `<span>${fact.sub}</span>` : ''
          }</dd></div>`,
        )
        .join('')}
    </dl>
    ${
      delisted
        ? `<p class="stock-note">这只股票在 ${latestYear} 年末之后不再出现在年鉴中，以上为最后收录年度。</p>`
        : ''
    }
    ${
      delta !== null && previous
        ? `<p class="stock-note">${latestYear} 年末自然人持股较上年 ${formatDelta(delta)}pp（${formatPercent(
            previous[1],
          )} → ${formatPercent(individual)}）。</p>`
        : ''
    }

    <div class="stock-composition" role="img" aria-label="${compositionLabel}">
      <div class="stock-composition__plot" style="--stock-years:${payload.years.length}">${compositionBars(
        payload,
        company,
      )}</div>
      <div class="stock-composition__axis" aria-hidden="true">${payload.years
        .map((year) => `<span>${year}</span>`)
        .join('')}</div>
    </div>
    <div class="stock-legend" aria-hidden="true">
      <span class="stock-legend__item"><span class="stock-legend__swatch stock-legend__swatch--individual"></span>自然人</span>
      <span class="stock-legend__item"><span class="stock-legend__swatch stock-legend__swatch--corporate"></span>一般法人</span>
      <span class="stock-legend__item"><span class="stock-legend__swatch stock-legend__swatch--institution"></span>专业机构</span>
      <span class="stock-legend__item"><span class="stock-legend__swatch stock-legend__swatch--other"></span>其他（残差）</span>
    </div>

    <div class="panel-table-wrap mt-8" role="region" aria-label="这只股票历年股东结构，可左右滚动" tabindex="0">
      <table class="panel-table">
        <caption class="sr-only">${escapeHtml(company.n)} 各年末的合计持股与三类股东持股比例。</caption>
        <thead><tr><th scope="col">年末</th><th scope="col">合计</th><th scope="col">自然人</th><th scope="col">一般法人</th><th scope="col">专业机构</th><th scope="col">其他</th></tr></thead>
        <tbody>${yearsTable(payload, company)}</tbody>
      </table>
    </div>
    <p class="panel-scroll-hint mt-3 font-ui text-label-11 text-ink-tertiary">表格可左右滑动，查看全部列。</p>
    <p class="stock-note">比例为占当年合计持股的比例；合计单位为亿股。2007–2008 年合计为流通股口径；2022 年起股东分类调整，跨年比较前先看 04 数据说明。</p>
    ${
      company.b === 'B股'
        ? '<p class="stock-note">B 股 2013 年末的 53 条记录全部记为自然人 100%，疑为原始表退化，仅作参考。</p>'
        : ''
    }
  `

  elements.detail.hidden = false
  elements.hint.hidden = true
  elements.message.hidden = true
  state.current = company
}

function showError(elements: LookupElements, text: string): void {
  elements.message.textContent = text
  elements.message.hidden = false
  elements.detail.hidden = true
  elements.hint.hidden = true
}

function selectCompany(elements: LookupElements, state: LookupState, company: ClientCompany): void {
  renderDetail(elements, state, company)
  closeResults(elements, state)
  elements.input.value = company.n
  const url = new URL(window.location.href)
  url.searchParams.set('stock', company.c)
  url.hash = 'stock'
  window.history.replaceState(null, '', url)
  elements.status.textContent = `已显示 ${company.n}（${company.c}）`
}

async function loadPayload(elements: LookupElements, state: LookupState): Promise<ClientPayload | null> {
  if (state.payload) return state.payload
  if (!state.loading) {
    state.loading = fetch(elements.endpoint, { headers: { accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<ClientPayload>
      })
      .then((payload) => {
        state.payload = payload
        state.yearRanking = yearRanking(payload)
        return payload
      })
      .finally(() => {
        state.loading = null
      })
  }

  try {
    return await state.loading
  } catch (error) {
    console.warn('Could not load the shareholder panel data', error)
    showError(elements, '个股数据加载失败，请刷新页面后重试。')
    return null
  }
}

function selectByCode(elements: LookupElements, state: LookupState, code: string, updateUrl: boolean): void {
  const payload = state.payload
  if (!payload) return
  const company = payload.companies.find((entry) => entry.c === code.padStart(6, '0'))
  if (!company) {
    showError(elements, `没有找到代码为 ${code} 的股票。`)
    return
  }

  selectCompany(elements, state, company)
  if (!updateUrl) {
    const url = new URL(window.location.href)
    url.searchParams.set('stock', company.c)
    url.hash = 'stock'
    window.history.replaceState(null, '', url)
  }
}

function initLookup(): void {
  const root = document.querySelector<HTMLElement>('[data-stock-lookup]')
  if (!root || root.dataset.ready === 'true') return

  const input = root.querySelector<HTMLInputElement>('#stock-search')
  const results = root.querySelector<HTMLUListElement>('#stock-results')
  const hint = root.querySelector<HTMLElement>('#stock-hint')
  const message = root.querySelector<HTMLElement>('[data-stock-message]')
  const status = root.querySelector<HTMLElement>('[data-stock-status]')
  const detail = root.querySelector<HTMLElement>('#stock-detail')
  const quickLinks = [...root.querySelectorAll<HTMLAnchorElement>('[data-stock-code]')]
  const endpoint = root.dataset.endpoint
  if (!input || !results || !hint || !message || !status || !detail || !endpoint) return

  const elements: LookupElements = {
    root,
    endpoint,
    latestYear: Number(root.dataset.latestYear),
    input,
    results,
    hint,
    message,
    status,
    detail,
    quickLinks,
  }
  const state: LookupState = {
    payload: null,
    loading: null,
    matches: [],
    selected: -1,
    current: null,
    yearRanking: null,
  }

  // Clicking an option must not blur the combobox before the click lands.
  results.addEventListener('mousedown', (event) => event.preventDefault())

  let debounce: ReturnType<typeof setTimeout> | undefined
  input.addEventListener('input', () => {
    clearTimeout(debounce)
    const query = input.value
    debounce = setTimeout(async () => {
      if (query.trim() === '') {
        closeResults(elements, state)
        return
      }
      if (!state.payload) await loadPayload(elements, state)
      renderResults(elements, state, query)
    }, 120)
  })

  input.addEventListener('focus', () => {
    if (input.value.trim() !== '' && state.payload) renderResults(elements, state, input.value)
  })

  input.addEventListener('keydown', async (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!state.payload) {
        await loadPayload(elements, state)
        renderResults(elements, state, input.value)
        return
      }
      if (state.matches.length === 0) renderResults(elements, state, input.value)
      setSelected(elements, state, state.selected + (event.key === 'ArrowDown' ? 1 : -1))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const company = state.matches[state.selected] ?? state.matches[0]
      if (company) selectCompany(elements, state, company)
      return
    }

    if (event.key === 'Escape') {
      closeResults(elements, state)
    }
  })

  input.addEventListener('blur', () => {
    // Keep the options available for a click; close on the next frame otherwise.
    setTimeout(() => {
      if (!root.contains(document.activeElement)) closeResults(elements, state)
    }, 150)
  })

  for (const link of quickLinks) {
    link.addEventListener('click', async (event) => {
      event.preventDefault()
      const code = link.dataset.stockCode ?? ''
      elements.message.textContent = '正在载入个股数据…'
      elements.message.hidden = false
      const payload = await loadPayload(elements, state)
      elements.message.hidden = true
      if (payload) selectByCode(elements, state, code, false)
    })
  }

  // Deep link: /shareholders/?stock=600519#stock. Render once the rows arrive, then
  // bring the lookup into view even if the browser handled the anchor before the
  // detail had rendered.
  const requested = new URL(window.location.href).searchParams.get('stock')
  if (requested) {
    elements.message.textContent = '正在载入个股数据…'
    elements.message.hidden = false
    loadPayload(elements, state).then((payload) => {
      if (!payload) return
      elements.message.hidden = true
      selectByCode(elements, state, requested, true)
      document.getElementById('stock')?.scrollIntoView({ block: 'start' })
    })
  }

  root.dataset.ready = 'true'
}

function init(): void {
  initMarket()
  initLookup()
}

init()
document.addEventListener('astro:after-swap', init)
