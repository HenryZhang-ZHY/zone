import {
  buildSellSheet,
  formatPercent,
  formatPrice,
  formatShares,
  isValidSellLot,
  maxSellableShares,
  SHEET_BAND_SIZE,
  type SellSheet,
} from '../lib/stock-sell-view'

type FieldName = 'cost' | 'shares' | 'dividend'

const FIELDS: FieldName[] = ['cost', 'shares', 'dividend']

interface ParsedInput {
  values: Record<FieldName, number | null>
  errors: Record<FieldName, string>
  complete: boolean
}

function parseInputs(cost: HTMLInputElement, shares: HTMLInputElement, dividend: HTMLInputElement): ParsedInput {
  const values: ParsedInput['values'] = { cost: null, shares: null, dividend: null }
  const errors: ParsedInput['errors'] = { cost: '', shares: '', dividend: '' }

  if (cost.value.trim() !== '') {
    const value = Number(cost.value)
    if (!Number.isFinite(value) || value <= 0) errors.cost = '成本需要大于 0。'
    else values.cost = value
  }

  if (shares.value.trim() !== '') {
    const value = Number(shares.value)
    if (!Number.isSafeInteger(value) || value <= 0) errors.shares = '请输入整数股数。'
    else if (value < 200) errors.shares = '至少需要 200 股：卖出 100 股，保留 100 股。'
    else values.shares = value
  }

  if (dividend.value.trim() !== '') {
    const value = Number(dividend.value)
    if (!Number.isFinite(value) || value < 0) errors.dividend = '分红不能小于 0。'
    else values.dividend = value
  }

  return {
    values,
    errors,
    complete: values.cost !== null && values.shares !== null && values.dividend !== null,
  }
}

function initSellSheet(): void {
  const root = document.querySelector<HTMLElement>('[data-sell-sheet]')
  if (!root || root.dataset.ready === 'true') return

  const inputs: Record<FieldName, HTMLInputElement | null> = {
    cost: root.querySelector<HTMLInputElement>('#sell-cost'),
    shares: root.querySelector<HTMLInputElement>('#sell-shares'),
    dividend: root.querySelector<HTMLInputElement>('#sell-dividend'),
  }

  if (!inputs.cost || !inputs.shares || !inputs.dividend) return

  const hint = root.querySelector<HTMLElement>('#sell-hint')
  const facts = root.querySelector<HTMLElement>('#sell-facts')
  const lotField = root.querySelector<HTMLElement>('#sell-lot-field')
  const lot = root.querySelector<HTMLInputElement>('#sell-lot')
  const lotError = root.querySelector<HTMLElement>('#sell-lot-error')
  const insight = root.querySelector<HTMLElement>('#sell-insight')
  const summary = root.querySelector<HTMLElement>('#sell-summary')
  const tableWrap = root.querySelector<HTMLElement>('#sell-table-wrap')
  const table = root.querySelector<HTMLTableElement>('#sell-table')
  const scrollHint = root.querySelector<HTMLElement>('#sell-scroll-hint')
  const tableNote = root.querySelector<HTMLElement>('#sell-table-note')
  const message = root.querySelector<HTMLElement>('#sell-message')
  const toggle = root.querySelector<HTMLButtonElement>('#sell-toggle')
  const head = root.querySelector<HTMLTableSectionElement>('#sell-head')
  const body = root.querySelector<HTMLTableSectionElement>('#sell-body')
  const status = root.querySelector<HTMLElement>('#sell-status')
  const factYield = root.querySelector<HTMLElement>('#sell-fact-yield')
  const factCost = root.querySelector<HTMLElement>('#sell-fact-cost')
  const factDividend = root.querySelector<HTMLElement>('#sell-fact-dividend')
  const factMax = root.querySelector<HTMLElement>('#sell-fact-max')

  if (
    !hint || !facts || !lotField || !lot || !lotError || !insight || !summary || !tableWrap || !table || !scrollHint ||
    !tableNote || !message || !toggle || !head || !body || !status ||
    !factYield || !factCost || !factDividend || !factMax
  ) return

  let expanded = false
  let current: SellSheet | null = null
  let announceTimer: ReturnType<typeof setTimeout> | undefined
  let lotBlurred = false

  function setHidden(element: HTMLElement, hidden: boolean): void {
    element.hidden = hidden
  }

  function clearTable(): void {
    head!.replaceChildren()
    body!.replaceChildren()
    setHidden(tableWrap!, true)
    setHidden(scrollHint!, true)
    setHidden(tableNote!, true)
    setHidden(insight!, true)
    setHidden(summary!, true)
    setHidden(toggle!, true)
    setHidden(lotField!, true)
    lotError!.textContent = ''
    lot!.removeAttribute('aria-invalid')
    lotBlurred = false
    toggle!.setAttribute('aria-expanded', 'false')
  }

  function setFieldState(field: FieldName, messageText: string): void {
    const input = inputs[field]!
    const error = root!.querySelector<HTMLElement>(`#sell-${field}-error`)
    error!.textContent = messageText
    if (messageText) {
      input.setAttribute('aria-invalid', 'true')
      input.setAttribute('aria-describedby', `sell-${field}-error`)
    } else {
      input.removeAttribute('aria-invalid')
      input.removeAttribute('aria-describedby')
    }
  }

  function updateFacts(parsed: ParsedInput): void {
    const { cost, shares, dividend } = parsed.values
    factYield!.textContent = cost !== null && dividend !== null ? formatPercent((dividend / cost) * 100) : '—'
    factCost!.textContent = cost !== null && shares !== null ? `${formatPrice(cost * shares)} 元` : '—'
    factDividend!.textContent = dividend !== null && shares !== null ? `${formatPrice(dividend * shares)} 元` : '—'
    factMax!.textContent = shares !== null ? `${formatShares(maxSellableShares(shares))} 股` : '—'
  }

  /** The optional lot the reader pins as its own column. */
  function readPinnedLot(shares: number | null): { lot: number | null; error: string } {
    const raw = lot!.value.trim()
    if (raw === '' || shares === null) return { lot: null, error: '' }

    const value = Number(raw)
    if (!isValidSellLot(value, shares)) {
      return {
        lot: null,
        error: `指定股数需为 100 的整数倍，且不超过 ${formatShares(maxSellableShares(shares))} 股。`,
      }
    }

    return { lot: value, error: '' }
  }

  function setLotState(message: string): void {
    lotError!.textContent = lotBlurred ? message : ''
    if (lotBlurred && message) lot!.setAttribute('aria-invalid', 'true')
    else lot!.removeAttribute('aria-invalid')
  }

  function headerMarkup(sheet: SellSheet): string {
    const sellCells = sheet.columns
      .map(
        (column) =>
          `<th scope="col" class="sell-th-sell${column.custom ? ' is-custom' : ''}">卖出 ${formatShares(column.sellShares)}${
            column.custom ? '<span class="sr-only">（指定）</span>' : ''
          }</th>`,
      )
      .join('')
    const remainCells = sheet.columns
      .map(
        (column) =>
          `<th scope="col" class="sell-th-remain${column.custom ? ' is-custom' : ''}">剩余 ${formatShares(column.remainingShares)}</th>`,
      )
      .join('')

    return `<tr>
      <th scope="col" rowspan="2" class="sell-th-yield sell-sticky-left">目标股息率</th>
      <th scope="col" rowspan="2" class="sell-th-cost sell-sticky-cost">摊薄成本</th>
      ${sellCells}
    </tr>
    <tr>${remainCells}</tr>`
  }

  function bodyMarkup(sheet: SellSheet): string {
    const bandSize = sheet.rows.length > SHEET_BAND_SIZE && !expanded ? SHEET_BAND_SIZE : sheet.rows.length

    return sheet.rows
      .map((row, index) => {
        const cells = row.prices
          .map(
            (price, columnIndex) =>
              `<td class="sell-td-price${sheet.columns[columnIndex]?.custom ? ' is-custom' : ''}">${
                price === null ? '—' : formatPrice(price)
              }</td>`,
          )
          .join('')
        return `<tr class="sell-row"${index >= bandSize ? ' hidden' : ''}>
          <th scope="row" class="sell-td-yield sell-sticky-left">${row.yieldPercent}%</th>
          <td class="sell-td-cost sell-sticky-cost">${formatPrice(row.dilutedCost)}</td>
          ${cells}
        </tr>`
      })
      .join('')
  }

  function insightText(sheet: SellSheet): string {
    const row = sheet.rows[0]
    const first = row.prices[0]
    const last = row.prices.at(-1)
    const firstColumn = sheet.columns[0]
    const lastColumn = sheet.columns.at(-1)!

    if (sheet.columns.length === 1 || first === null || last === null || last === undefined) {
      return `${row.yieldPercent}% 目标下，卖出 ${formatShares(firstColumn.sellShares)} 股需 ${formatPrice(first ?? last ?? 0)} 元。`
    }

    return `${row.yieldPercent}% 目标下，只卖 ${formatShares(firstColumn.sellShares)} 股需 ${formatPrice(first)} 元；卖 ${formatShares(lastColumn.sellShares)} 股只需 ${formatPrice(last)} 元。`
  }

  function summaryText(sheet: SellSheet): string {
    const shown = expanded ? sheet.rows.length : Math.min(SHEET_BAND_SIZE, sheet.rows.length)
    return `${shown} 档目标股息率 × ${sheet.columns.length} 种卖出股数，共 ${shown * sheet.columns.length} 个价格。`
  }

  function announce(text: string): void {
    clearTimeout(announceTimer)
    announceTimer = setTimeout(() => {
      status!.textContent = text
    }, 600)
  }

  function render(sheet: SellSheet): void {
    current = sheet
    setHidden(hint!, true)
    setHidden(message!, true)
    message!.textContent = ''
    setHidden(tableWrap!, false)
    setHidden(scrollHint!, false)
    setHidden(tableNote!, false)
    setHidden(insight!, false)
    setHidden(summary!, false)
    setHidden(lotField!, false)

    head!.innerHTML = headerMarkup(sheet)
    body!.innerHTML = bodyMarkup(sheet)
    table!.style.setProperty('--sell-columns', String(sheet.columns.length))
    insight!.textContent = insightText(sheet)
    summary!.textContent = summaryText(sheet)

    const cost = inputs.cost!.value.trim()
    tableNote!.textContent = `价格为元/股。表内价格均高于买入成本 ${formatPrice(Number(cost))} 元，未计交易费用与税费。`

    if (sheet.rows.length > SHEET_BAND_SIZE) {
      setHidden(toggle!, false)
      toggle!.textContent = expanded ? `收起，只看前 ${SHEET_BAND_SIZE} 档` : `显示全部 ${sheet.rows.length} 档`
      toggle!.setAttribute('aria-expanded', String(expanded))
    } else {
      setHidden(toggle!, true)
      toggle!.setAttribute('aria-expanded', 'false')
    }

    announce(`已生成 ${sheet.rows.length} 档目标股息率、${sheet.columns.length} 种卖出股数的价格。`)
  }

  function update(): void {
    const parsed = parseInputs(inputs.cost!, inputs.shares!, inputs.dividend!)
    const pinned = readPinnedLot(parsed.values.shares)

    FIELDS.forEach((field) => setFieldState(field, parsed.errors[field]))
    updateFacts(parsed)
    setHidden(facts!, !FIELDS.some((field) => inputs[field]!.value.trim() !== ''))
    setLotState(pinned.error)

    if (parsed.complete) {
      const sheet = buildSellSheet(
        {
          costPerShare: parsed.values.cost!,
          shares: parsed.values.shares!,
          dividendPerShare: parsed.values.dividend!,
        },
        pinned.lot,
      )

      if (sheet.rows.length === 0) {
        clearTable()
        setHidden(hint!, true)
        setHidden(message!, false)
        message!.textContent = `成本股息率已达 ${formatPercent(sheet.costYieldPercent)}，没有更高的目标股息率可算。`
        status!.textContent = ''
        return
      }

      render(sheet)
      return
    }

    current = null
    clearTable()
    setHidden(message!, true)
    setHidden(hint!, Object.values(parsed.errors).some(Boolean))
    status!.textContent = ''
  }

  toggle.addEventListener('click', () => {
    if (!current) return
    expanded = !expanded
    body!.innerHTML = bodyMarkup(current)
    summary!.textContent = summaryText(current)
    toggle.textContent = expanded ? `收起，只看前 ${SHEET_BAND_SIZE} 档` : `显示全部 ${current.rows.length} 档`
    toggle.setAttribute('aria-expanded', String(expanded))
  })

  lot.addEventListener('input', () => {
    lotBlurred = false
    update()
  })

  lot.addEventListener('change', () => {
    lotBlurred = true
    update()
  })

  FIELDS.forEach((field) => {
    inputs[field]!.addEventListener('input', update)
    inputs[field]!.addEventListener('change', update)
  })

  update()
  root.dataset.ready = 'true'
}

initSellSheet()
document.addEventListener('astro:after-swap', initSellSheet)
