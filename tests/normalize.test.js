import { describe, it, expect } from 'bun:test'
import { parse } from '../src/core/parser.js'
import { normalize } from '../src/core/normalize.js'

describe('normalize', () => {
  it('flattens nested unions', () => {
    const ast = parse('string | (number | boolean)');
    const norm = normalize(ast);
    expect(norm.kind).toBe('union');
    expect(norm.members.length).toBe(3);
    const names = norm.members.map(m => m.name);
    expect(names).toEqual(['string', 'number', 'boolean']);
  });

  it('keeps properties intact', () => {
    const ast = parse('{ name: string, tags: string[] }');
    const norm = normalize(ast);
    expect(norm.kind).toBe('object');
    expect(norm.properties.length).toBe(2);
  });

  it('collapses nested optionals', () => {
    const ast = parse('string??');
    const norm = normalize(ast);
    expect(norm.kind).toBe('optional');
    expect(norm.inner.kind).toBe('primitive');
  });
})
