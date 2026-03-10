// Cached for cross-realm safety — works across iframes, vm.runInNewContext, etc.
const _toString = Object.prototype.toString;

/**
 * Returns a precise, lowercase type string for any JavaScript value.
 *
 * Fixes the well-known gaps in `typeof`:
 *   - `null`      → "null"    (not "object")
 *   - `[]`        → "array"   (not "object")
 *   - `NaN`       → "nan"     (not "number")
 *   - `new Map()` → "map", `new Set()` → "set", etc.
 *
 * Supports custom extension via hooks:
 *   realType(val, { hooks: [v => v instanceof MyClass ? 'myclass' : null] })
 *
 * @param {*}      value
 * @param {{hooks?: Array<(v: *) => string|null>}} [options]
 * @returns {string}
 */
export function realType(value, options) {
  // --- Custom hooks (extensibility) ---
  if (options !== undefined) {
    const hooks = options.hooks;
    if (hooks !== undefined) {
      for (let i = 0; i < hooks.length; i++) {
        const result = hooks[i](value);
        if (result != null) return result;
      }
    }
  }

  // --- Null fast-path ---
  if (value === null) return 'null';

  const t = typeof value;

  // --- Primitives (string, number, boolean, bigint, symbol, undefined) ---
  if (t !== 'object' && t !== 'function') {
    return t === 'number' && Number.isNaN(value) ? 'nan' : t;
  }

  // --- Function subtypes (cross-realm safe via toString tag) ---
  if (t === 'function') {
    const tag = _toString.call(value);
    if (tag === '[object AsyncFunction]') return 'asyncfunction';
    if (tag === '[object GeneratorFunction]') return 'generatorfunction';
    if (tag === '[object AsyncGeneratorFunction]')
      return 'asyncgeneratorfunction';
    return 'function';
  }

  // --- Object subtypes ---
  // Array check first — it's the most common non-plain-object case
  if (Array.isArray(value)) return 'array';

  const tag = _toString.call(value);
  switch (tag) {
    case '[object Date]':
      return 'date';
    case '[object RegExp]':
      return 'regexp';
    case '[object Map]':
      return 'map';
    case '[object Set]':
      return 'set';
    case '[object Promise]':
      return 'promise';
    case '[object WeakMap]':
      return 'weakmap';
    case '[object WeakSet]':
      return 'weakset';
    default:
      return 'object';
  }
}
