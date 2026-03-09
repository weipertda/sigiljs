import { describe, it, expect } from 'bun:test'
import { tokenize } from '../src/core/tokenizer.js'

describe('tokenizer', () => {
  it('tokenizes identifiers and simple types', () => {
    const tokens = tokenize('string')
    expect(tokens[0]).toMatchObject({ kind: 'identifier', value: 'string', line: 1, column: 1 })
    expect(tokens[1]).toMatchObject({ kind: 'eof' })
  })

  it('tokenizes punctuation', () => {
    const tokens = tokenize('?|[]{}:,')
    const kinds = tokens.map(t => t.kind)
    expect(kinds).toEqual(['?', '|', '[', ']', '{', '}', ':', ',', 'eof'])
  })

  it('tokenizes object schemas', () => {
    const input = `{ name: string, age?: number }`
    const tokens = tokenize(input)
    const values = tokens.map(t => t.value)
    expect(values).toEqual(['{', 'name', ':', 'string', ',', 'age', '?', ':', 'number', '}', ''])
  })

  it('handles strings and numbers', () => {
    const tokens = tokenize(`"foo" 42`)
    expect(tokens[0]).toMatchObject({ kind: 'string literal', value: 'foo' })
    expect(tokens[2]).toMatchObject({ kind: 'number literal', value: 42 })
  })

  it('handles booleans and null', () => {
    const tokens = tokenize(`true false null`)
    expect(tokens[0]).toMatchObject({ kind: 'boolean literal', value: true })
    expect(tokens[2]).toMatchObject({ kind: 'boolean literal', value: false })
    expect(tokens[4]).toMatchObject({ kind: 'null literal', value: null })
  })

  it('throws on unsupported chars', () => {
    expect(() => tokenize('^')).toThrow('Unexpected character "^"')
  })
})
