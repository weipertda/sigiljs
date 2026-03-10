import { assert } from './core/assert.js';
import { compile } from './core/compile.js';
import { normalize } from './core/normalize.js';
import { parse } from './core/parser.js';
import { partial } from './core/partial.js';
import { validate } from './core/validate.js';

// Memoize fully-constructed Sigil objects by raw schema string.
// Identical tagged template calls (e.g. T`string | number` in two modules)
// return the exact same object reference — zero re-parse, zero re-compile.
const _sigilCache = new Map();

/**
 * Creates a SigilJS schema validator from a tagged template literal.
 *
 * Each unique schema string is parsed, normalized, and compiled exactly once.
 * Subsequent calls with the same schema string return the cached sigil object.
 *
 * @param {TemplateStringsArray} strings
 * @param {...*} values - Interpolations (embedded JS values)
 * @returns {{ raw, ast, normalized, check, assert, compile }}
 *
 * @example
 * const User = Sigil`{ name: string, age?: number }`
 * User.check({ name: 'Alice' })  // true
 * User.assert({ name: 42 })      // throws SigilValidationError
 */
export function Sigil(strings, ...values) {
  // Reconstruct raw string from template parts (supports interpolations)
  let raw = strings[0];
  for (let i = 0; i < values.length; i++) raw += values[i] + strings[i + 1];

  // Return memoized sigil if already compiled
  const cached = _sigilCache.get(raw);
  if (cached !== undefined) return cached;

  // Parse → Normalize → Partial-evaluate → Compile pipeline
  const ast = parse(raw);
  const normalized = partial(normalize(ast));

  // Warm validator cache eagerly (avoids cold-start cost on first .check() call)
  compile(normalized);

  const sigil = Object.freeze({
    raw,
    ast,
    normalized,
    check: (value, opts) => validate(sigil, value, opts),
    assert: (value, opts) => assert(sigil, value, opts),
    compile: () => compile(normalized),
  });

  _sigilCache.set(raw, sigil);
  return sigil;
}
