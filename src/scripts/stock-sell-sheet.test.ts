import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

class ElementStub {
  value = ''
  textContent = ''
  innerHTML = ''
  hidden = false
  dataset: Record<string, string> = {}
  attributes = new Map<string, string>()
  listeners = new Map<string, Array<() => void>>()
  style = { setProperty: vi.fn() }

  constructor(private elements: Record<string, ElementStub> = {}) {}

  querySelector(selector: string): ElementStub | null {
    return this.elements[selector] ?? null
  }

  addEventListener(type: string, listener: () => void): void {
    const list = this.listeners.get(type) ?? []
    list.push(listener)
    this.listeners.set(type, list)
  }

  dispatch(type: string): void {
    this.listeners.get(type)?.forEach((listener) => listener())
  }

  replaceChildren(): void {
    this.innerHTML = ''
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value)
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name)
  }
}

const SELECTORS = [
  '#sell-cost', '#sell-shares', '#sell-dividend',
  '#sell-cost-error', '#sell-shares-error', '#sell-dividend-error',
  '#sell-facts', '#sell-hint', '#sell-insight', '#sell-summary',
  '#sell-table-wrap', '#sell-table', '#sell-scroll-hint', '#sell-table-note',
  '#sell-lot-field', '#sell-lot', '#sell-lot-error',
  '#sell-message', '#sell-toggle', '#sell-head', '#sell-body', '#sell-status',
  '#sell-fact-yield', '#sell-fact-cost', '#sell-fact-dividend', '#sell-fact-max',
]

async function setup() {
  const elements = Object.fromEntries(SELECTORS.map((selector) => [selector, new ElementStub()])) as Record<string, ElementStub>
  const root = new ElementStub(elements)
  vi.stubGlobal('document', {
    querySelector: (selector: string) => (selector === '[data-sell-sheet]' ? root : null),
    addEventListener: vi.fn(),
  })
  vi.resetModules()
  await import('./stock-sell-sheet')
  return elements
}

function enter(elements: Record<string, ElementStub>, values: { cost?: string; shares?: string; dividend?: string }) {
  const fields = { cost: '#sell-cost', shares: '#sell-shares', dividend: '#sell-dividend' }
  for (const [field, selector] of Object.entries(fields)) {
    const value = values[field as keyof typeof values]
    if (value === undefined) continue
    elements[selector].value = value
    elements[selector].dispatch('input')
  }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('sell sheet', () => {
  it('asks for input before showing a table', async () => {
    const elements = await setup()
    expect(elements['#sell-hint'].hidden).toBe(false)
    expect(elements['#sell-table-wrap'].hidden).toBe(true)
    expect(elements['#sell-facts'].hidden).toBe(true)
  })

  it('shows the derived facts as soon as a value is typed', async () => {
    const elements = await setup()
    enter(elements, { cost: '10', shares: '1000', dividend: '0.5' })
    expect(elements['#sell-fact-yield'].textContent).toBe('5.00%')
    expect(elements['#sell-fact-cost'].textContent).toBe('10,000.00 元')
    expect(elements['#sell-fact-dividend'].textContent).toBe('500.00 元')
    expect(elements['#sell-fact-max'].textContent).toBe('900 股')
    expect(elements['#sell-facts'].hidden).toBe(false)
  })

  it('renders one row per viable yield and one column per lot', async () => {
    const elements = await setup()
    enter(elements, { cost: '10', shares: '1000', dividend: '0.5' })

    expect(elements['#sell-table-wrap'].hidden).toBe(false)
    expect(elements['#sell-hint'].hidden).toBe(true)
    expect(elements['#sell-summary'].textContent).toContain('15 档')
    expect(elements['#sell-summary'].textContent).toContain('135 个价格')
    expect(elements['#sell-head'].innerHTML).toContain('卖出 100')
    expect(elements['#sell-head'].innerHTML).toContain('剩余 900')
    expect(elements['#sell-body'].innerHTML).toContain('6%')
    expect(elements['#sell-body'].innerHTML).toContain('25.00')
    expect(elements['#sell-body'].innerHTML).toContain('10.19')
    expect(elements['#sell-insight'].textContent).toContain('25.00')
    expect(elements['#sell-insight'].textContent).toContain('10.19')
    expect(elements['#sell-toggle'].textContent).toBe('显示全部 95 档')
  })

  it('collapses the remaining yields behind the toggle', async () => {
    const elements = await setup()
    enter(elements, { cost: '10', shares: '1000', dividend: '0.5' })
    expect(elements['#sell-body'].innerHTML).toContain('hidden')

    elements['#sell-toggle'].dispatch('click')
    expect(elements['#sell-body'].innerHTML).not.toContain('hidden')
    expect(elements['#sell-toggle'].textContent).toBe('收起，只看前 15 档')
  })

  it('rejects a share count that cannot leave 100 shares', async () => {
    const elements = await setup()
    enter(elements, { cost: '10', shares: '150', dividend: '0.5' })
    expect(elements['#sell-shares-error'].textContent).toContain('至少需要 200 股')
    expect(elements['#sell-shares'].attributes.get('aria-invalid')).toBe('true')
    expect(elements['#sell-table-wrap'].hidden).toBe(true)
  })

  it('explains an empty sheet when the cost yield is already 100%', async () => {
    const elements = await setup()
    enter(elements, { cost: '10', shares: '1000', dividend: '10' })
    expect(elements['#sell-table-wrap'].hidden).toBe(true)
    expect(elements['#sell-message'].hidden).toBe(false)
    expect(elements['#sell-message'].textContent).toContain('成本股息率已达 100.00%')
  })

  it('keeps a zero-dividend sheet, where every target cost is zero', async () => {
    const elements = await setup()
    enter(elements, { cost: '10', shares: '1000', dividend: '0' })
    expect(elements['#sell-fact-yield'].textContent).toBe('0.00%')
    expect(elements['#sell-body'].innerHTML).toContain('4%')
    expect(elements['#sell-body'].innerHTML).toContain('100.00')
    expect(elements['#sell-toggle'].textContent).toBe('显示全部 97 档')
  })

  it('pins any 100-share lot as its own column', async () => {
    const elements = await setup()
    enter(elements, { cost: '10', shares: '10000', dividend: '1' })
    expect(elements['#sell-lot-field'].hidden).toBe(false)

    elements['#sell-lot'].value = '8400'
    elements['#sell-lot'].dispatch('input')

    expect(elements['#sell-head'].innerHTML).toContain('卖出 8,400')
    expect(elements['#sell-head'].innerHTML).toContain('剩余 1,600')
    expect(elements['#sell-head'].innerHTML).toContain('is-custom')
    expect(elements['#sell-table'].style.setProperty).toHaveBeenCalledWith('--sell-columns', '9')
    expect(elements['#sell-lot-error'].textContent).toBe('')
  })

  it('explains an invalid pinned lot and keeps the decile sheet', async () => {
    const elements = await setup()
    enter(elements, { cost: '10', shares: '10000', dividend: '1' })

    elements['#sell-lot'].value = '8450'
    elements['#sell-lot'].dispatch('change')

    expect(elements['#sell-lot-error'].textContent).toContain('100 的整数倍')
    expect(elements['#sell-lot'].attributes.get('aria-invalid')).toBe('true')
    expect(elements['#sell-table-wrap'].hidden).toBe(false)
    expect(elements['#sell-head'].innerHTML).not.toContain('is-custom')
  })

  it('clears the table when an input becomes invalid', async () => {
    const elements = await setup()
    enter(elements, { cost: '10', shares: '1000', dividend: '0.5' })
    expect(elements['#sell-table-wrap'].hidden).toBe(false)

    enter(elements, { shares: '1000.5' })
    expect(elements['#sell-table-wrap'].hidden).toBe(true)
    expect(elements['#sell-shares-error'].textContent).toContain('整数股数')
  })
})
