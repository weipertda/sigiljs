import { realType } from '../core/realType.js';
import { validatorCache, canonicalize } from './cache.js';

/**
 * Compiles a normalized+partially-evaluated SigilJS AST into a fast validator function.
 *
 * Validators are memoized by structural identity (via JSON canonicalization).
 * A validator function has the signature: (value, opts?) => boolean
 *
 * @param {object} ast - Normalized & partially-evaluated AST node
 * @returns {(value: *, opts?: object) => boolean}
 */
export function compile(ast) {
  if (!ast) return () => true;

  const key = canonicalize(ast);
  const cached = validatorCache.get(key);
  if (cached !== undefined) return cached;

  const validator = build(ast);
  validatorCache.set(key, validator);
  return validator;
}

/**
 * Recursively builds a validator closure from an AST node.
 * @param {object} ast
 * @returns {Function}
 */
function build(ast) {
  switch (ast.kind) {
    case 'primitive': {
      const p = ast.name;
      if (p === 'any' || p === 'unknown') return () => true;
      if (p === 'never') return () => false;
      // typeof-based fast-path for JS primitives (no realType overhead)
      if (
        p === 'string' ||
        p === 'number' ||
        p === 'boolean' ||
        p === 'symbol' ||
        p === 'bigint' ||
        p === 'undefined'
      ) {
        return (v) => typeof v === p;
      }
      return (v, opts) => realType(v, opts) === p;
    }

    case 'literal': {
      const val = ast.value;
      return (v) => v === val;
    }

    case 'literal_union': {
      // Fast-path: Set membership for 5+ literals, Array.includes for fewer
      if (ast.values.length < 5) {
        const arr = ast.values;
        return (v) => arr.includes(v);
      }
      const set = new Set(ast.values);
      return (v) => set.has(v);
    }

    case 'primitive_union': {
      const names = ast.names;
      // If all names are typeof-checkable, skip realType entirely
      const allSimple = names.every(
        (n) =>
          n === 'string' ||
          n === 'number' ||
          n === 'boolean' ||
          n === 'symbol' ||
          n === 'bigint' ||
          n === 'undefined',
      );
      return allSimple ?
          (v) => names.includes(typeof v)
        : (v, opts) => names.includes(realType(v, opts));
    }

    case 'union': {
      const fns = ast.members.map(build);
      const len = fns.length;
      return (v, opts) => {
        for (let i = 0; i < len; i++) {
          if (fns[i](v, opts)) return true;
        }
        return false;
      };
    }

    case 'array': {
      const el = build(ast.element);
      return (v, opts) => {
        if (!Array.isArray(v)) return false;
        for (let i = 0; i < v.length; i++) {
          if (!el(v[i], opts)) return false;
        }
        return true;
      };
    }

    case 'optional': {
      const inner = build(ast.inner);
      return (v, opts) => v === undefined || inner(v, opts);
    }

    case 'object': {
      // Use pre-computed hint arrays from partial evaluation to avoid
      // re-filtering on every validator invocation (pure win — zero cost at compile time)
      const { hints, properties } = ast;
      const req =
        hints ?
          hints.requiredKeys.map((k) => ({
            key: k,
            check: build(properties.find((p) => p.key === k).value),
          }))
        : properties
            .filter((p) => !p.optional)
            .map((p) => ({ key: p.key, check: build(p.value) }));
      const opt =
        hints ?
          hints.optionalKeys.map((k) => ({
            key: k,
            check: build(properties.find((p) => p.key === k).value),
          }))
        : properties
            .filter((p) => p.optional)
            .map((p) => ({ key: p.key, check: build(p.value) }));

      const reqLen = req.length;
      const optLen = opt.length;

      return (v, opts) => {
        if (typeof v !== 'object' || v === null || Array.isArray(v))
          return false;
        for (let i = 0; i < reqLen; i++) {
          const p = req[i];
          if (!(p.key in v) || !p.check(v[p.key], opts)) return false;
        }
        for (let i = 0; i < optLen; i++) {
          const p = opt[i];
          if (p.key in v && v[p.key] !== undefined && !p.check(v[p.key], opts))
            return false;
        }
        return true;
      };
    }

    default:
      return () => false;
  }
}
