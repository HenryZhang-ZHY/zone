import { describe, expect, it } from 'vitest'
import {
  buildDsibsViewModel,
  formatRate,
  groupCapitalAddon,
  groupKeys,
  groupLabels,
  groupLeverageAddon,
  groupScoreBands,
  typeClass,
  typeLabel,
} from '../d-sibs'

type TestEntry = Parameters<typeof buildDsibsViewModel>[0][number]

const entries: TestEntry[] = [
  {
    year: 2024,
    published: new Date('2024-09-09'),
    link: 'https://example.com/2024',
    groups: [
      {
        level: 4,
        banks: [{ name: 'Alpha Bank', type: '国有商业银行' }],
      },
      {
        level: 2,
        banks: [{ name: 'Beta Bank', type: '股份制商业银行' }],
      },
    ],
  },
  {
    year: 2025,
    published: new Date('2025-09-09'),
    link: 'https://example.com/2025',
    groups: [
      {
        level: 4,
        banks: [
          { name: 'Alpha Bank', type: '国有商业银行' },
          { name: 'Gamma Bank', type: '城市商业银行' },
        ],
      },
      {
        level: 1,
        banks: [{ name: 'Beta Bank', type: '股份制商业银行' }],
      },
    ],
  },
]

describe('buildDsibsViewModel', () => {
  it('de-duplicates bank names across years', () => {
    const viewModel = buildDsibsViewModel(entries)

    expect(viewModel.sortedBanks.map((bank) => bank.name).sort()).toEqual([
      'Alpha Bank',
      'Beta Bank',
      'Gamma Bank',
    ])
  })

  it('sorts by latest group descending and then bank type order', () => {
    const viewModel = buildDsibsViewModel(entries)

    expect(viewModel.sortedBanks.map((bank) => bank.name)).toEqual([
      'Alpha Bank',
      'Gamma Bank',
      'Beta Bank',
    ])
  })

  it('detects entered, downgraded, upgraded, and exited changes between years', () => {
    const viewModel = buildDsibsViewModel([
      ...entries,
      {
        year: 2026,
        published: new Date('2026-09-09'),
        link: 'https://example.com/2026',
        groups: [
          {
            level: 3,
            banks: [{ name: 'Beta Bank', type: '股份制商业银行' }],
          },
        ],
      },
    ])

    expect(viewModel.changes).toEqual([
      {
        from: '2024',
        to: '2025',
        entered: [['Gamma Bank', 4]],
        exited: [],
        upgraded: [],
        downgraded: [['Beta Bank', 2, 1]],
      },
      {
        from: '2025',
        to: '2026',
        entered: [],
        exited: ['Alpha Bank', 'Gamma Bank'],
        upgraded: [['Beta Bank', 1, 3]],
        downgraded: [],
      },
    ])
  })

  it('defaults missing groups to empty lists in year stats', () => {
    const viewModel = buildDsibsViewModel(entries)

    expect(viewModel.yearStats[0].groups[1]).toEqual([])
    expect(viewModel.yearStats[0].groups[3]).toEqual([])
    expect(viewModel.yearStats[0].groups[5]).toEqual([])
    expect(viewModel.yearStats[0].total).toBe(2)
  })

  it('carries each release date into the year stats', () => {
    const viewModel = buildDsibsViewModel(entries)

    expect(viewModel.yearStats.map((stats) => stats.published)).toEqual([
      new Date('2024-09-09'),
      new Date('2025-09-09'),
    ])
  })
})

describe('D-SIBS labels and classes', () => {
  it('keeps group labels and type display helpers centralized', () => {
    expect(groupLabels[4]).toBe('第四组')
    expect(typeLabel('国有商业银行')).toBe('国有')
    expect(typeLabel('股份制商业银行')).toBe('股份制')
    expect(typeLabel('城市商业银行')).toBe('城商行')
    expect(typeClass('国有商业银行', 'tag')).toBe('tag-state')
    expect(typeClass('股份制商业银行', 'spark')).toBe('spark-joint')
    expect(typeClass('城市商业银行', '')).toBe('-city')
  })

  it('keeps the leverage add-on at half the capital add-on for every group', () => {
    for (const group of groupKeys) {
      expect(groupLeverageAddon[group]).toBeCloseTo(groupCapitalAddon[group] / 2)
    }
  })

  it('prints the published rates without trailing zeros', () => {
    expect(formatRate(groupCapitalAddon[1])).toBe('0.25%')
    expect(formatRate(groupCapitalAddon[4])).toBe('1%')
    expect(formatRate(groupLeverageAddon[5])).toBe('0.75%')
    expect(groupScoreBands[1]).toBe('100—299 分')
  })
})
