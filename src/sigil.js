import { assert } from './core/assert.js';
import { compile } from './core/compile.js';
import { normalize } from './core/normalize.js';
import { parse } from './core/parser.js';
import { partial } from './core/partial.js';
import { register } from './core/registry.js';
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
 */
function createSigil(options, strings, ...values) {
  // Reconstruct raw string from template parts (supports interpolations)
  let raw = strings[0];
  for (let i = 0; i < values.length; i++) raw += values[i] + strings[i + 1];

  // Cache key includes options to distinguish exact vs non-exact versions of same schema
  const cacheKey = JSON.stringify(options) + raw;
  const cached = _sigilCache.get(cacheKey);
  if (cached !== undefined) return cached;

  // Parse → Normalize → Partial-evaluate → Compile pipeline
  const ast = parse(raw, options);
  const normalized = partial(normalize(ast));

  // Warm validator cache eagerly (avoids cold-start cost on first .check() call)
  compile(normalized);

  const sigil = Object.freeze({
    raw,
    ast,
    normalized,
    options,
    check: (value, opts) => validate(sigil, value, opts),
    assert: (value, opts) => assert(sigil, value, opts),
    compile: () => compile(normalized),
  });

  _sigilCache.set(cacheKey, sigil);
  return sigil;
}

/**
 * Default Sigil tagged template (non-strict objects).
 */
export function Sigil(strings, ...values) {
  return createSigil({ exact: false }, strings, ...values);
}

/**
 * Strict Sigil tagged template (exact objects, fails on extra properties).
 */
Sigil.exact = function (strings, ...values) {
  return createSigil({ exact: true }, strings, ...values);
};

/**
 * Creates a named Sigil and registers it in the global registry.
 *
 * @param {string} name
 * @returns {Function} Tagged template function
 */
Sigil.named = function (name) {
  return function (strings, ...values) {
    const sigil = createSigil({ exact: false, named: name }, strings, ...values);
    register(name, sigil);
    return sigil;
  };
};
