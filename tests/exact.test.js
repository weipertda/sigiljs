import { expect, test, describe } from 'bun:test';
import { Sigil } from '../src/sigil.js';

describe('Exact Object Mode', () => {
  test('Sigil.exact should fail on extra properties', () => {
    const User = Sigil.exact`{ name: string }`;
    
    expect(User.check({ name: 'Alex' })).toBe(true);
    expect(User.check({ name: 'Alex', extra: true })).toBe(false);
  });

  test('Normal Sigil should allow extra properties', () => {
    const User = Sigil`{ name: string }`;
    
    expect(User.check({ name: 'Alex' })).toBe(true);
    expect(User.check({ name: 'Alex', extra: true })).toBe(true);
  });

  test('Sigil.exact with optional properties', () => {
    const User = Sigil.exact`{ name: string, age?: number }`;
    
    expect(User.check({ name: 'Alex' })).toBe(true);
    expect(User.check({ name: 'Alex', age: 30 })).toBe(true);
    expect(User.check({ name: 'Alex', age: 30, extra: true })).toBe(false);
  });

  test('Sigil.exact with nested objects (global check)', () => {
    // Current implementation: if creating via Sigil.exact, all objects in the sigil are exact.
    const User = Sigil.exact`{ 
      name: string, 
      profile: { bio: string } 
    }`;
    
    expect(User.check({ 
      name: 'Alex', 
      profile: { bio: 'hello' } 
    })).toBe(true);

    expect(User.check({ 
      name: 'Alex', 
      profile: { bio: 'hello', extra: 1 } 
    })).toBe(false);
  });
});
