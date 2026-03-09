import { describe, it, expect } from 'bun:test'
import { T } from '../src/index.js'

describe('object schemas and Tagged Template', () => {
  it('validates primitive structures', () => {
    const Name = T`string`
    expect(Name.check('D')).toBe(true)
    expect(Name.check(42)).toBe(false)
  })

  it('validates optional suffix', () => {
    const MaybeName = T`string?`
    expect(MaybeName.check(undefined)).toBe(true)
    expect(MaybeName.check('foo')).toBe(true)
    expect(MaybeName.check(null)).toBe(false)
  })

  it('validates objects', () => {
    const User = T`
    {
      name: string
      age?: number
    }
    `
    expect(User.check({ name: 'D' })).toBe(true)
    expect(User.check({ name: 'D', age: 30 })).toBe(true)
    expect(User.check({ age: 30 })).toBe(false)
    expect(User.check('foo')).toBe(false)
  })

  it('exposes sigil shape', () => {
    const User = T`{ a: string }`
    expect(User).toHaveProperty('raw')
    expect(User).toHaveProperty('ast')
    expect(User).toHaveProperty('normalized')
    expect(typeof User.check).toBe('function')
    expect(typeof User.assert).toBe('function')
  })
})
