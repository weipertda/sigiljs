import { describe, it, expect } from 'bun:test'
import { parse } from '../src/core/parser.js'

describe('parser', () => {
  it('parses primitives', () => {
    expect(parse('string')).toEqual({ kind: 'primitive', name: 'string' })
  })
  
  it('parses array postfix', () => {
    expect(parse('number[]')).toEqual({
      kind: 'array',
      element: { kind: 'primitive', name: 'number' }
    })
  })

  it('parses unions', () => {
    expect(parse('string | number')).toEqual({
      kind: 'union',
      members: [
        { kind: 'primitive', name: 'string' },
        { kind: 'primitive', name: 'number' }
      ]
    })
  })

  it('parses optional', () => {
    expect(parse('string?')).toEqual({
      kind: 'optional',
      inner: { kind: 'primitive', name: 'string' }
    })
  })

  it('parses complex postfix and precedence', () => {
    expect(parse('(string | number)[]')).toEqual({
      kind: 'array',
      element: {
        kind: 'union',
        members: [
          { kind: 'primitive', name: 'string' },
          { kind: 'primitive', name: 'number' }
        ]
      }
    })
  })

  it('parses objects with comma', () => {
    expect(parse('{ name: string, age?: number }')).toEqual({
      kind: 'object',
      exact: false,
      properties: [
        { key: 'name', optional: false, value: { kind: 'primitive', name: 'string' } },
        { key: 'age', optional: true, value: { kind: 'primitive', name: 'number' } }
      ]
    })
  })

  it('parses objects with newlines', () => {
    const input = `{
      name: string
      age?: number
    }`
    expect(parse(input)).toEqual({
      kind: 'object',
      exact: false,
      properties: [
        { key: 'name', optional: false, value: { kind: 'primitive', name: 'string' } },
        { key: 'age', optional: true, value: { kind: 'primitive', name: 'number' } }
      ]
    })
  })

  it('parses nested objects', () => {
    const input = `{ profile: { email: string, tags: string[] } }`
    expect(parse(input).properties[0].value.kind).toBe('object')
    expect(parse(input).properties[0].value.properties.length).toBe(2)
  })

  it('throws on invalid syntax', () => {
    expect(() => parse('string |')).toThrow()
    expect(() => parse('| number')).toThrow()
    expect(() => parse('{name string}')).toThrow('Expected ":"')
    expect(() => parse('[]')).toThrow()
    expect(() => parse('?')).toThrow()
  })
})
