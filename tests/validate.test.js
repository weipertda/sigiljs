import { describe, it, expect } from 'bun:test'
import { parse } from '../src/core/parser.js'
import { normalize } from '../src/core/normalize.js'
import { partial } from '../src/core/partial.js'
import { validate } from '../src/core/validate.js'
import { assert } from '../src/core/assert.js'

describe('validate & assert', () => {
  it('validates correctly', () => {
    const ast = partial(normalize(parse('{ a: string }')));
    expect(validate(ast, { a: 'foo' })).toBe(true);
    expect(validate(ast, { a: 42 })).toBe(false);
  });

  it('assert throws structured error', () => {
    const ast = partial(normalize(parse('{ a: string }')));
    try {
      assert(ast, { a: 42 });
      expect(true).toBe(false); // Should not reach
    } catch (err) {
      expect(err.code).toBe('SIGIL_VALIDATION_FAILED');
      expect(err.path).toEqual(['a']);
      expect(err.expected).toBe('string');
      expect(err.actual).toBe('number');
    }
  });

  it('assert deep structure failure', () => {
    const ast = partial(normalize(parse('{ profile: { email: string[], age?: number } }')));
    try {
      assert(ast, { profile: { email: [42] } });
      expect(true).toBe(false); 
    } catch (err) {
      expect(err.path).toEqual(['profile', 'email', '0']);
      expect(err.expected).toBe('string');
      expect(err.actual).toBe('number');
    }
  });
})
