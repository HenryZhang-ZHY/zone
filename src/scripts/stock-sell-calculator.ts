import { calcSellPoints, type SellPoint } from '../lib/stock-sell-calc'

function formatCurrency(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPercent(n: number): string {
  return `${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

function yieldClass(pct: number): string {
  if (pct <= 10) return 'yield-low'
  if (pct <= 20) return 'yield-mid'
  if (pct <= 40) return 'yield-high'
  return 'yield-max'
}

function appendText(parent: HTMLElement, className: string, text: string, tagName = 'div'): HTMLElement {
  const element = document.createElement(tagName)
  element.className = className
  element.textContent = text
  parent.appendChild(element)
  return element
}

function appendResultRow(parent: HTMLTableSectionElement, point: SellPoint): void {
  const row = document.createElement('tr')

  const yieldCell = document.createElement('td')
  yieldCell.className = 'col-yield'
  appendText(yieldCell, `z-tag yield-pill ${yieldClass(point.yieldPercent)}`, `${point.yieldPercent}%`, 'span')
  row.appendChild(yieldCell)

  appendText(row, 'col-lots', `${point.sharesToSell.toLocaleString('zh-CN')} 股`, 'td')
  appendText(row, 'col-price', formatCurrency(point.sellPrice), 'td')
  appendText(row, 'col-cost', formatCurrency(point.dilutedCost), 'td')
  appendText(row, 'col-remain', `${point.remainingShares.toLocaleString('zh-CN')} 股`, 'td')

  const profitCell = document.createElement('td')
  profitCell.className = 'col-profit'
  appendText(profitCell, 'profit-pos', `+${formatPercent(point.profitPercent)}`, 'span')
  row.appendChild(profitCell)

  parent.appendChild(row)
}

function setError(errorEl: HTMLElement, message: string): void {
  errorEl.textContent = message
  errorEl.hidden = message.length === 0
}

function initStockSellCalculator(): void {
  const root = document.querySelector<HTMLElement>('[data-stock-sell-calculator]')
  if (!root || root.dataset.ready === 'true') return

  const costInput = root.querySelector<HTMLInputElement>('#cost')
  const sharesInput = root.querySelector<HTMLInputElement>('#shares')
  const dividendInput = root.querySelector<HTMLInputElement>('#dividend')
  const calcBtn = root.querySelector<HTMLButtonElement>('#calc-btn')
  const resultSection = root.querySelector<HTMLElement>('#result-section')
  const resultBody = root.querySelector<HTMLTableSectionElement>('#result-body')
  const resultTitle = root.querySelector<HTMLElement>('#result-title')
  const resultSummary = root.querySelector<HTMLElement>('#result-summary')
  const errorEl = root.querySelector<HTMLElement>('#calculator-error')
  const statusEl = root.querySelector<HTMLElement>('#calculator-status')
  const naturalYieldEl = root.querySelector<HTMLElement>('#natural-yield-value')

  if (!costInput || !sharesInput || !dividendInput || !calcBtn || !resultSection || !resultBody || !resultTitle || !resultSummary || !errorEl || !statusEl || !naturalYieldEl) return

  function updateNaturalYield(): void {
    const cost = Number.parseFloat(costInput.value)
    const dividend = Number.parseFloat(dividendInput.value)

    if (!costInput.value || !dividendInput.value || !Number.isFinite(cost) || cost <= 0 || !Number.isFinite(dividend) || dividend < 0) {
      naturalYieldEl.textContent = '—'
      return
    }

    naturalYieldEl.textContent = formatPercent((dividend / cost) * 100)
  }

  function calculate(): void {
    const cost = Number(costInput.value)
    const shares = Number(sharesInput.value)
    const dividend = Number(dividendInput.value)

    const invalidField = !costInput.value || !Number.isFinite(cost) || cost <= 0
      ? { input: costInput, message: '请输入大于 0 的每股买入成本。' }
      : !sharesInput.value || !Number.isSafeInteger(shares) || shares <= 0
        ? { input: sharesInput, message: '请输入大于 0 的整数持有股数。' }
        : !dividendInput.value || !Number.isFinite(dividend) || dividend < 0
          ? { input: dividendInput, message: '请输入大于或等于 0 的每股分红。' }
          : null

    if (invalidField) {
      invalidField.input.setAttribute('aria-invalid', 'true')
      setError(errorEl, invalidField.message)
      resultSection.hidden = true
      statusEl.textContent = ''
      invalidField.input.focus()
      return
    }

    const points = calcSellPoints({ costPerShare: cost, shares, dividendPerShare: dividend })

    if (points.length === 0) {
      setError(errorEl, shares < 200
        ? '没有可计算的卖点：至少需要持有 200 股，才能卖出 100 股并保留 100 股。'
        : '没有找到高于买入成本的卖点。可调整买入成本或每股分红后重试。')
      resultSection.hidden = true
      statusEl.textContent = ''
      return
    }

    setError(errorEl, '')
    updateNaturalYield()

    resultBody.replaceChildren()
    points.forEach((point) => appendResultRow(resultBody, point))

    resultSummary.textContent = `共 ${points.length.toLocaleString('zh-CN')} 个结果，按目标股息率、卖出股数从小到大排列。价格和成本单位均为元/股。`
    resultSection.hidden = false
    statusEl.textContent = `已找到 ${points.length.toLocaleString('zh-CN')} 个卖点，结果见下方。`
    resultSection.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    })
    resultTitle.focus({ preventScroll: true })
  }

  calcBtn.addEventListener('click', calculate)
  ;[costInput, sharesInput, dividendInput].forEach((input) => {
    input.addEventListener('input', () => {
      input.removeAttribute('aria-invalid')
      setError(errorEl, '')
      statusEl.textContent = ''
      resultSection.hidden = true
      updateNaturalYield()
    })
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') calculate()
    })
  })

  updateNaturalYield()
  root.dataset.ready = 'true'
}

initStockSellCalculator()
document.addEventListener('astro:after-swap', initStockSellCalculator)
