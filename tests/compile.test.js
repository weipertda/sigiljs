import { describe, it, expect } from 'bun:test'
import { parse } from '../src/core/parser.js'
import { normalize } from '../src/core/normalize.js'
import { partial } from '../src/core/partial.js'
import { compile } from '../src/core/compile.js'

describe('compiler', () => {
  it('compiles and validates primitives', () => {
    const ast = partial(normalize(parse('string')));
    const check = compile(ast);
    expect(check('hello')).toBe(true);
    expect(check(42)).toBe(false);
  });

  it('compiles unions', () => {
    const ast = partial(normalize(parse('string | number')));
    const check = compile(ast);
    expect(check('hello')).toBe(true);
    expect(check(42)).toBe(true);
    expect(check(false)).toBe(false);
  });

  it('compiles objects', () => {
    const ast = partial(normalize(parse('{ name: string, age?: number }')));
    const check = compile(ast);
    expect(check({ name: 'D' })).toBe(true);
    expect(check({ name: 'D', age: 42 })).toBe(true);
    expect(check({ age: 42 })).toBe(false);
    expect(check('not object')).toBe(false);
    expect(check(null)).toBe(false);
  });

  it('memoizes compilation', () => {
    const ast1 = partial(normalize(parse('object')));
    const ast2 = partial(normalize(parse('object')));
    const check1 = compile(ast1);
    const check2 = compile(ast2);
    expect(check1).toBe(check2);
  });
})
