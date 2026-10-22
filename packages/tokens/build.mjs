// Generates packages/tokens/tokens.css from tokens.json.
// tokens.json is the only source; the generated file is checked in so the
// design app and the UI package can be consumed without a build step.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
export const TOKENS_PATH = resolve(here, 'tokens.json')
export const CSS_PATH = resolve(here, 'tokens.css')

const GROUPS = ['font', 'space', 'radius', 'motion', 'shadow', 'layout']

function typeVars(name, token) {
  return [
    `  --z-text-${name}: ${token.size};`,
    `  --z-leading-${name}: ${token['line-height']};`,
    `  --z-weight-${name}: ${token.weight};`,
    `  --z-tracking-${name}: ${token.tracking};`,
  ]
}

export function generate(tokens = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'))) {
  const lightKeys = Object.keys(tokens.color.light).sort()
  const darkKeys = Object.keys(tokens.color.dark).sort()
  const missing = lightKeys.filter((key) => !darkKeys.includes(key))
  const extra = darkKeys.filter((key) => !lightKeys.includes(key))
  if (missing.length || extra.length) {
    throw new Error(`Color themes disagree. Missing in dark: ${missing.join(', ') || 'none'}. Extra in dark: ${extra.join(', ') || 'none'}.`)
  }

  const lines = [
    '/* Generated from tokens.json by build.mjs. Do not edit by hand. */',
    '',
    ':root {',
    '  /* Color: the same semantic name resolves per theme. */',
  ]

  for (const key of lightKeys) {
    lines.push(`  --z-color-${key}: light-dark(${tokens.color.light[key]}, ${tokens.color.dark[key]});`)
  }

  lines.push('', '  /* Families */')
  for (const [key, value] of Object.entries(tokens.font)) {
    lines.push(`  --z-font-${key}: ${value};`)
  }

  lines.push('', '  /* Type scale */')
  for (const [name, token] of Object.entries(tokens.type)) {
    lines.push(...typeVars(name, token))
  }

  for (const group of GROUPS) {
    lines.push('', `  /* ${group[0].toUpperCase()}${group.slice(1)} */`)
    for (const [key, value] of Object.entries(tokens[group])) {
      lines.push(`  --z-${group}-${key}: ${value};`)
    }
  }

  lines.push('}')

  return `${lines.join('\n').trimEnd()}\n`
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url

if (isMain) {
  const tokens = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'))
  writeFileSync(CSS_PATH, generate(tokens))
  console.log(`tokens: wrote ${CSS_PATH}`)
}
