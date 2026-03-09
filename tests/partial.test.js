import { describe, it, expect } from 'bun:test'
import { parse } from '../src/core/parser.js'
import { normalize } from '../src/core/normalize.js'
import { partial } from '../src/core/partial.js'

describe('partial evaluation', () => {
  it('optimizes literal unions', () => {
    const ast = partial(normalize(parse('"a" | "b" | "c"')));
    expect(ast.kind).toBe('literal_union');
    expect(ast.values).toEqual(['a', 'b', 'c']);
  });

  it('optimizes primitive unions', () => {
    const ast = partial(normalize(parse('string | number')));
    expect(ast.kind).toBe('primitive_union');
    expect(ast.names).toEqual(['string', 'number']);
  });

  it('hints object properties', () => {
    const ast = partial(normalize(parse('{ a: string, b?: number }')));
    expect(ast.kind).toBe('object');
    expect(ast.hints.requiredKeys).toEqual(['a']);
    expect(ast.hints.optionalKeys).toEqual(['b']);
  });
})
