import { afterEach, describe, expect, it, vi } from 'vitest'
import { calcSellPoints } from '../lib/stock-sell-calc'

class ElementStub {
  value = ''
  textContent = ''
  hidden = false
  dataset: Record<string, string> = {}
  className = ''
  children: ElementStub[] = []
  attributes = new Map<string, string>()
  listeners = new Map<string, (event: { key?: string }) => void>()
  focus = vi.fn()
  scrollIntoView = vi.fn()

  constructor(private elements: Record<string, ElementStub> = {}) {}

  querySelector(selector: string): ElementStub | null {
    return this.elements[selector] ?? null
  }

  addEventListener(type: string, listener: (event: { key?: string }) => void): void {
    this.listeners.set(type, listener)
  }

  dispatch(type: string, event: { key?: string } = {}): void {
    this.listeners.get(type)?.(event)
  }

  appendChild(child: ElementStub): void {
    this.children.push(child)
  }

  replaceChildren(): void {
    this.children = []
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value)
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name)
  }
}

async function setup() {
  const selectors = [
    '#cost', '#shares', '#dividend', '#calc-btn', '#result-section', '#result-body',
    '#result-title', '#result-summary', '#calculator-error', '#calculator-status', '#natural-yield-value',
  ]
  const elements = Object.fromEntries(selectors.map((selector) => [selector, new ElementStub()])) as Record<string, ElementStub>
  const root = new ElementStub(elements)
  elements['#result-section'].hidden = true
  const documentStub = {
    querySelector: () => root,
    createElement: () => new ElementStub(),
    addEventListener: vi.fn(),
  }
  vi.stubGlobal('document', documentStub)
  vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) })
  vi.resetModules()
  await import('./stock-sell-calculator')
  return elements
}

afterEach(() => vi.unstubAllGlobals())

describe('stock-sell calculator UI', () => {
  it('shows the existing calculated sell points with an accessible result summary', async () => {
    const elements = await setup()
    elements['#cost'].value = '10'
    elements['#shares'].value = '200'
    elements['#dividend'].value = '0.50'
    elements['#dividend'].dispatch('input')
    elements['#calc-btn'].dispatch('click')

    const count = calcSellPoints({ costPerShare: 10, shares: 200, dividendPerShare: 0.5 }).length
    expect(elements['#natural-yield-value'].textContent).toBe('5.00%')
    expect(elements['#result-section'].hidden).toBe(false)
    expect(elements['#result-body'].children).toHaveLength(count)
    expect(elements['#result-summary'].textContent).toContain(`${count} 个结果`)
    const eightPercentRow = elements['#result-body'].children.find((row) => row.children[0].children[0].textContent === '8%')
    expect(eightPercentRow?.children[2].textContent).toBe('13.75')
    expect(elements['#result-title'].focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(elements['#result-section'].scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'start' })
  })

  it('identifies an invalid share count and clears stale results when edited', async () => {
    const elements = await setup()
    elements['#cost'].value = '10'
    elements['#shares'].value = '200'
    elements['#dividend'].value = '0.5'
    elements['#calc-btn'].dispatch('click')

    elements['#shares'].value = '200.5'
    elements['#shares'].dispatch('input')
    expect(elements['#result-section'].hidden).toBe(true)
    expect(elements['#calculator-status'].textContent).toBe('')
    elements['#calc-btn'].dispatch('click')
    expect(elements['#shares'].attributes.get('aria-invalid')).toBe('true')
    expect(elements['#calculator-error'].textContent).toContain('整数持有股数')
    expect(elements['#shares'].focus).toHaveBeenCalled()
  })

  it('explains when too few shares remain for a sell point', async () => {
    const elements = await setup()
    elements['#cost'].value = '10'
    elements['#shares'].value = '100'
    elements['#dividend'].value = '0'
    elements['#calc-btn'].dispatch('click')

    expect(elements['#natural-yield-value'].textContent).toBe('—')
    expect(elements['#result-section'].hidden).toBe(true)
    expect(elements['#calculator-error'].textContent).toContain('至少需要持有 200 股')
  })

  it('keeps zero-dividend results and reports when no profitable points exist', async () => {
    const elements = await setup()
    elements['#cost'].value = '10'
    elements['#shares'].value = '200'
    elements['#dividend'].value = '0'
    elements['#dividend'].dispatch('input')
    elements['#calc-btn'].dispatch('click')
    expect(elements['#natural-yield-value'].textContent).toBe('0.00%')
    expect(elements['#result-body'].children).toHaveLength(97)

    elements['#dividend'].value = '100'
    elements['#dividend'].dispatch('input')
    elements['#calc-btn'].dispatch('click')
    expect(elements['#result-section'].hidden).toBe(true)
    expect(elements['#calculator-error'].textContent).toContain('没有找到高于买入成本的卖点')
  })
})
