export type BankType = '国有商业银行' | '股份制商业银行' | '城市商业银行'

export type BankEntry = {
  name: string
  type: BankType
}

export type DsibsEntry = {
  year: number
  link: string
  groups: {
    level: number
    banks: BankEntry[]
  }[]
}

export type YearData = {
  1: BankEntry[]
  2: BankEntry[]
  3: BankEntry[]
  4: BankEntry[]
  5: BankEntry[]
  link: string
}

export type BankHistory = {
  name: string
  years: Record<string, { group: number; type: BankType } | null>
  latestType: BankType | ''
}

export type YearStats = {
  year: string
  total: number
  link: string
  groups: Record<number, BankEntry[]>
}

export type YearChange = {
  from: string
  to: string
  entered: [string, number][]
  exited: string[]
  upgraded: [string, number, number][]
  downgraded: [string, number, number][]
}

export const groupKeys = [1, 2, 3, 4, 5] as const

export const groupLabels: Record<number, string> = {
  1: '第一组',
  2: '第二组',
  3: '第三组',
  4: '第四组',
  5: '第五组',
}

const typeOrder: Record<BankType, number> = {
  国有商业银行: 0,
  股份制商业银行: 1,
  城市商业银行: 2,
}

export function getGroups(yd: YearData): [number, BankEntry[]][] {
  return groupKeys.map((g) => [g, yd[g]])
}

export function typeClass(type: BankType | string, prefix: string): string {
  if (type === '国有商业银行') return `${prefix}-state`
  if (type === '股份制商业银行') return `${prefix}-joint`
  return `${prefix}-city`
}

export function typeLabel(type: BankType | string): string {
  if (type === '国有商业银行') return '国有'
  if (type === '股份制商业银行') return '股份制'
  return '城商行'
}

function normalizeEntries(entries: DsibsEntry[]): {
  years: string[]
  data: Record<string, YearData>
} {
  const sortedEntries = [...entries].sort((a, b) => a.year - b.year)
  const years = sortedEntries.map((entry) => String(entry.year))

  const data = Object.fromEntries(
    sortedEntries.map((entry) => {
      const byLevel = Object.fromEntries(entry.groups.map((g) => [g.level, g.banks]))
      return [
        String(entry.year),
        {
          1: byLevel[1] ?? [],
          2: byLevel[2] ?? [],
          3: byLevel[3] ?? [],
          4: byLevel[4] ?? [],
          5: byLevel[5] ?? [],
          link: entry.link,
        } satisfies YearData,
      ]
    }),
  )

  return { years, data }
}

function findBank(
  data: Record<string, YearData>,
  year: string,
  bankName: string,
): { group: number; type: BankType } | null {
  const yd = data[year]
  if (!yd) return null

  for (const [group, entries] of getGroups(yd)) {
    const entry = entries.find((e) => e.name === bankName)
    if (entry) return { group, type: entry.type }
  }

  return null
}

export function buildDsibsViewModel(entries: DsibsEntry[]): {
  years: string[]
  data: Record<string, YearData>
  sortedBanks: BankHistory[]
  yearStats: YearStats[]
  changes: YearChange[]
} {
  const { years, data } = normalizeEntries(entries)

  const allBankNames = [
    ...new Set(
      years.flatMap((year) =>
        getGroups(data[year])
          .flatMap(([, bankEntries]) => bankEntries)
          .map((entry) => entry.name),
      ),
    ),
  ]

  const bankHistories: BankHistory[] = allBankNames.map((name) => {
    const history: BankHistory['years'] = {}
    let latestType: BankHistory['latestType'] = ''

    for (const year of years) {
      const found = findBank(data, year, name)
      history[year] = found
      if (found) latestType = found.type
    }

    return { name, years: history, latestType }
  })

  const latestYear = years[years.length - 1]
  const sortedBanks = [...bankHistories].sort((a, b) => {
    const latestA = a.years[latestYear]?.group ?? 0
    const latestB = b.years[latestYear]?.group ?? 0
    if (latestB !== latestA) return latestB - latestA
    return (typeOrder[a.latestType as BankType] ?? 3) - (typeOrder[b.latestType as BankType] ?? 3)
  })

  const yearStats = years.map((year) => {
    const yd = data[year]
    const groups: Record<number, BankEntry[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] }
    let total = 0

    for (const [group, bankEntries] of getGroups(yd)) {
      groups[group] = bankEntries
      total += bankEntries.length
    }

    return { year, total, link: yd.link, groups }
  })

  const changes: YearChange[] = []
  for (let i = 1; i < years.length; i++) {
    const from = years[i - 1]
    const to = years[i]
    const entered: YearChange['entered'] = []
    const exited: YearChange['exited'] = []
    const upgraded: YearChange['upgraded'] = []
    const downgraded: YearChange['downgraded'] = []

    for (const bankHistory of bankHistories) {
      const prev = bankHistory.years[from]
      const curr = bankHistory.years[to]

      if (!prev && curr) entered.push([bankHistory.name, curr.group])
      else if (prev && !curr) exited.push(bankHistory.name)
      else if (prev && curr && curr.group > prev.group) upgraded.push([bankHistory.name, prev.group, curr.group])
      else if (prev && curr && curr.group < prev.group) downgraded.push([bankHistory.name, prev.group, curr.group])
    }

    changes.push({ from, to, entered, exited, upgraded, downgraded })
  }

  return { years, data, sortedBanks, yearStats, changes }
}
