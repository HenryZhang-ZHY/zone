import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

interface DesignDoc {
  frontmatter: Map<string, string>
  sections: Map<string, string>
}

// DESIGN.md files must be self-contained, so the light and dark docs repeat
// their theme-independent parts. These must stay identical.
const SHARED_FRONTMATTER = ['version', 'name', 'fontFamilies', 'typography', 'spacing', 'rounded', 'layout']
const SHARED_SECTIONS = ['Typography', 'Layout', 'Shapes', 'Responsive Behavior', 'Voice & Content', 'Languages']

function parseDesignDoc(file: string): DesignDoc {
  const source = readFileSync(resolve(root, file), 'utf8').replace(/\r\n/g, '\n')
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error(`${file} has no frontmatter`)

  const frontmatter = new Map<string, string>()
  let key = ''
  for (const line of match[1].split('\n')) {
    const top = line.match(/^([A-Za-z]\w*):/)
    if (top) key = top[1]
    frontmatter.set(key, `${frontmatter.get(key) ?? ''}${line}\n`)
  }

  const sections = new Map<string, string>()
  let heading = ''
  for (const line of match[2].split('\n')) {
    if (line.startsWith('## ')) heading = line.slice(3)
    else sections.set(heading, `${sections.get(heading) ?? ''}${line}\n`)
  }

  return { frontmatter, sections }
}

describe('DESIGN docs', () => {
  const light = parseDesignDoc('DESIGN.md')
  const dark = parseDesignDoc('DESIGN.dark.md')

  it.each(SHARED_FRONTMATTER)('share the %s frontmatter block', (key) => {
    expect(light.frontmatter.get(key)).toBeDefined()
    expect(dark.frontmatter.get(key)).toBe(light.frontmatter.get(key))
  })

  it.each(SHARED_SECTIONS)('share the %s section', (heading) => {
    expect(light.sections.get(heading)).toBeDefined()
    expect(dark.sections.get(heading)).toBe(light.sections.get(heading))
  })

  it('name font families after the CSS tokens', () => {
    const css = readFileSync(resolve(root, 'src', 'styles', 'global.css'), 'utf8')
    const families = light.frontmatter.get('fontFamilies') ?? ''
    for (const name of ['ui', 'code', 'reading']) {
      expect(families).toMatch(new RegExp(`^  ${name}: `, 'm'))
      expect(css).toContain(`--z-font-${name}:`)
    }
  })
})
