import { validate } from './validate.js';
import { SigilValidationError } from './errors.js';
import { realType } from '../realType.js';

export function assert(astOrSigil, value, opts) {
  if (validate(astOrSigil, value, opts)) {
    return true;
  }
  
  const ast = astOrSigil.normalized || astOrSigil.ast || astOrSigil;
  
  // Slow path to dynamically find the exact error structure
  const err = findError(ast, value, opts, []);
  if (err) {
    throw new SigilValidationError(err.message, err.path, err.expected, err.actual);
  }
  
  // generic fallback
  throw new SigilValidationError('Validation failed', [], 'match', realType(value, opts));
}

function findError(ast, value, opts, path) {
  if (!ast) return null;

  switch (ast.kind) {
    case 'primitive': {
      const p = ast.name;
      if (p === 'any' || p === 'unknown') return null;
      if (p === 'never') return { message: `Expected never, got ${realType(value, opts)}`, path, expected: 'never', actual: realType(value, opts) };
      
      const t = typeof value;
      if (['string', 'number', 'boolean', 'symbol', 'bigint', 'undefined'].includes(p)) {
        if (t !== p) return { message: `Expected ${p}, got ${t}`, path, expected: p, actual: t };
        return null;
      }
      
      const actual = realType(value, opts);
      if (actual !== p) return { message: `Expected property "${path.join('.')}" to be ${p}`, path, expected: p, actual };
      return null;
    }
    case 'literal': {
      if (value !== ast.value) return { message: `Expected literal ${ast.value}, got ${typeof value}`, path, expected: String(ast.value), actual: String(value) };
      return null;
    }
    case 'literal_union': {
      if (!ast.values.includes(value)) return { message: `Expected one of [${ast.values.join(', ')}], got ${String(value)}`, path, expected: ast.values.join(' | '), actual: String(value) };
      return null;
    }
    case 'primitive_union': {
      const actualType = realType(value, opts);
      if (!ast.names.includes(actualType)) return { message: `Expected one of [${ast.names.join(', ')}], got ${actualType}`, path, expected: ast.names.join(' | '), actual: actualType };
      return null;
    }
    case 'union': {
      return { message: `Does not match union`, path, expected: 'union', actual: realType(value, opts) };
    }
    case 'optional': {
      if (value === undefined) return null;
      return findError(ast.inner, value, opts, path);
    }
    case 'array': {
      if (!Array.isArray(value)) return { message: `Expected array, got ${realType(value, opts)}`, path, expected: 'array', actual: realType(value, opts) };
      for (let i = 0; i < value.length; i++) {
        const err = findError(ast.element, value[i], opts, [...path, String(i)]);
        if (err) return err;
      }
      return null;
    }
    case 'object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { message: `Expected object, got ${realType(value, opts)}`, path, expected: 'object', actual: realType(value, opts) };
      }
      for (const p of ast.properties) {
        if (!p.optional && !(p.key in value)) {
           return { message: `Missing required property "${p.key}"`, path: [...path, p.key], expected: p.value.kind, actual: 'undefined' };
        }
        if (p.key in value && value[p.key] !== undefined) {
           const err = findError(p.value, value[p.key], opts, [...path, p.key]);
           if (err) return err;
        }
      }
      return null;
    }
  }
  return null;
}
