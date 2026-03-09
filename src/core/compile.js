import { realType } from '../realType.js';
import { validatorCache, canonicalize } from './cache.js';

export function compile(ast) {
  if (!ast) return () => true;

  const key = canonicalize(ast);
  if (validatorCache.has(key)) {
    return validatorCache.get(key);
  }

  const validator = build(ast);
  validatorCache.set(key, validator);
  return validator;
}

function build(ast) {
  switch (ast.kind) {
    case 'primitive': {
      const p = ast.name;
      if (p === 'any' || p === 'unknown') return () => true;
      if (p === 'never') return () => false;
      if (['string', 'number', 'boolean', 'symbol', 'bigint', 'undefined'].includes(p)) {
        return v => typeof v === p;
      }
      return (v, opts) => realType(v, opts) === p;
    }
    case 'literal': {
      const val = ast.value;
      return v => v === val;
    }
    case 'literal_union': {
      if (ast.values.length < 5) {
        const arr = ast.values;
        return v => arr.includes(v);
      }
      const set = new Set(ast.values);
      return v => set.has(v);
    }
    case 'primitive_union': {
      const names = ast.names;
      const hasRealtype = names.some(n => !['string', 'number', 'boolean', 'symbol', 'bigint', 'undefined'].includes(n));
      if (!hasRealtype) {
        return v => names.includes(typeof v);
      }
      return (v, opts) => names.includes(realType(v, opts));
    }
    case 'union': {
      const fns = ast.members.map(build);
      return (v, opts) => {
        for (let i = 0; i < fns.length; i++) {
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
      const props = ast.properties.map(p => ({
        key: p.key,
        optional: p.optional,
        check: build(p.value)
      }));
      
      const req = props.filter(p => !p.optional);
      const opt = props.filter(p => p.optional);
      
      return (v, opts) => {
        if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
        for (let i = 0; i < req.length; i++) {
          const p = req[i];
          if (!(p.key in v) || !p.check(v[p.key], opts)) return false;
        }
        for (let i = 0; i < opt.length; i++) {
          const p = opt[i];
          if (p.key in v && v[p.key] !== undefined) {
            if (!p.check(v[p.key], opts)) return false;
          }
        }
        return true;
      };
    }
    default:
      return () => false;
  }
}
