import { expect, test, describe, beforeEach } from 'bun:test';
import { Sigil } from '../src/sigil.js';
import { clear } from '../src/core/registry.js';

describe('Named Sigils', () => {
  beforeEach(() => {
    clear();
  });

  test('should resolve named sigils', () => {
    const Email = Sigil.named('Email')`string`;
    const User = Sigil`{ email: Email }`;

    expect(User.check({ email: 'test@example.com' })).toBe(true);
    expect(User.check({ email: 123 })).toBe(false);
  });

  test('should support multiple levels of naming', () => {
    Sigil.named('ID')`number`;
    Sigil.named('User')`{ id: ID, name: string }`;
    const Org = Sigil`{ owner: User }`;

    expect(Org.check({ owner: { id: 1, name: 'Alex' } })).toBe(true);
    expect(Org.check({ owner: { id: 'one', name: 'Alex' } })).toBe(false);
  });

  test('should handle circular references gracefully', () => {
    // A -> { b: B | null }
    // B -> { a: A | null }
    const A = Sigil.named('A')`{ b: B | null }`;
    const B = Sigil.named('B')`{ a: A | null }`;

    const valid = { b: { a: { b: null } } };
    expect(A.check(valid)).toBe(true);
    expect(A.check({ b: { a: { b: 123 } } })).toBe(false);
  });

  test('should throw on unknown references at validation time', () => {
    const UnknownWrap = Sigil`{ ref: Missing }`;
    expect(() => UnknownWrap.check({ ref: 1 })).toThrow(/Unknown sigil reference: Missing/);
  });
});

