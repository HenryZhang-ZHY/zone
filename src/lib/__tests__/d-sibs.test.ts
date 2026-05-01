import { describe, expect, it } from 'vitest'
import { buildDsibsViewModel, groupLabels, typeClass, typeLabel } from '../d-sibs'

type TestEntry = Parameters<typeof buildDsibsViewModel>[0][number]

const entries: TestEntry[] = [
  {
    year: 2024,
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
})
