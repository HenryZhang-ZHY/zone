import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CSS_PATH, TOKENS_PATH, generate } from './build.mjs'

describe('tokens.css', () => {
  it('is generated from tokens.json', () => {
    const tokens = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'))
    expect(readFileSync(CSS_PATH, 'utf8')).toBe(generate(tokens))
  })

  it('keeps the light and dark themes in step', () => {
    const tokens = JSON.parse(readFileSync(TOKENS_PATH, 'utf8'))
    expect(Object.keys(tokens.color.light).sort()).toEqual(Object.keys(tokens.color.dark).sort())
  })
})
