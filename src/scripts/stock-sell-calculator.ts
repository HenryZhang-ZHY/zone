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
  const errorEl = root.querySelector<HTMLElement>('#calculator-error')
  const naturalYieldEl = root.querySelector<HTMLElement>('#natural-yield-value')

  if (!costInput || !sharesInput || !dividendInput || !calcBtn || !resultSection || !resultBody || !errorEl || !naturalYieldEl) return

  function updateNaturalYield(): void {
    const cost = Number.parseFloat(costInput.value)
    const dividend = Number.parseFloat(dividendInput.value)

    if (!cost || cost <= 0 || Number.isNaN(dividend) || dividend < 0) {
      naturalYieldEl.textContent = '—'
      return
    }

    naturalYieldEl.textContent = formatPercent((dividend / cost) * 100)
  }

  function calculate(): void {
    const cost = Number.parseFloat(costInput.value)
    const shares = Number.parseInt(sharesInput.value, 10)
    const dividend = Number.parseFloat(dividendInput.value)

    if (!cost || cost <= 0 || !shares || shares <= 0 || Number.isNaN(dividend) || dividend < 0) {
      setError(errorEl, '请输入有效的参数：买入成本和份额必须为正数，分红不能为负数。')
      resultSection.hidden = true
      return
    }

    const points = calcSellPoints({ costPerShare: cost, shares, dividendPerShare: dividend })

    if (points.length === 0) {
      setError(errorEl, '没有找到可获利的卖点。请确认持仓份额至少 200 股，或调整买入成本和分红参数。')
      resultSection.hidden = true
      return
    }

    setError(errorEl, '')
    updateNaturalYield()

    resultBody.replaceChildren()
    points.forEach((point) => appendResultRow(resultBody, point))

    resultSection.hidden = false
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  calcBtn.addEventListener('click', calculate)
  ;[costInput, sharesInput, dividendInput].forEach((input) => {
    input.addEventListener('input', updateNaturalYield)
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') calculate()
    })
  })

  updateNaturalYield()
  root.dataset.ready = 'true'
}

initStockSellCalculator()
document.addEventListener('astro:after-swap', initStockSellCalculator)
