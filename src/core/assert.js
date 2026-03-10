import { validate } from './validate.js';
import { SigilValidationError } from './errors.js';
import { realType } from './realType.js';

/**
 * Validates a value against a schema and throws a structured `SigilValidationError`
 * if validation fails. Returns `true` if validation passes.
 *
 * @param {object} astOrSigil - Raw AST, or a Sigil object with `.normalized` / `.ast`
 * @param {*} value           - The value to validate
 * @param {object} [opts]     - Optional hooks / options
 * @returns {true}
 * @throws {SigilValidationError}
 */
export function assert(astOrSigil, value, opts) {
  if (validate(astOrSigil, value, opts)) return true;

  const ast = astOrSigil.normalized ?? astOrSigil.ast ?? astOrSigil;

  // Walk the AST to find the precise failure point for a rich error
  const err = findError(ast, value, opts, []);
  if (err)
    throw new SigilValidationError(
      err.message,
      err.path,
      err.expected,
      err.actual,
    );

  // Generic fallback (should rarely be reached)
  throw new SigilValidationError(
    'Validation failed',
    [],
    'match',
    realType(value, opts),
  );
}

/**
 * Recursively walks the AST to find the deepest node that fails for `value`,
 * returning a structured error descriptor or null if no specific failure is found.
 *
 * @param {object}   ast
 * @param {*}        value
 * @param {object}   opts
 * @param {string[]} path - Current property path (accumulated for error reporting)
 * @returns {{ message: string, path: string[], expected: string, actual: string } | null}
 */
function findError(ast, value, opts, path) {
  if (!ast) return null;

  switch (ast.kind) {
    case 'primitive': {
      const p = ast.name;
      if (p === 'any' || p === 'unknown') return null;
      if (p === 'never') {
        const actual = realType(value, opts);
        return {
          message: `Expected never, got ${actual}`,
          path,
          expected: 'never',
          actual,
        };
      }
      // typeof-checkable primitives
      if (
        p === 'string' ||
        p === 'number' ||
        p === 'boolean' ||
        p === 'symbol' ||
        p === 'bigint' ||
        p === 'undefined'
      ) {
        const t = typeof value;
        return t !== p ?
            { message: `Expected ${p}, got ${t}`, path, expected: p, actual: t }
          : null;
      }
      const actual = realType(value, opts);
      return actual !== p ?
          { message: `Expected ${p}, got ${actual}`, path, expected: p, actual }
        : null;
    }

    case 'literal': {
      if (value !== ast.value) {
        return {
          message: `Expected literal ${JSON.stringify(ast.value)}, got ${JSON.stringify(value)}`,
          path,
          expected: String(ast.value),
          actual: String(value),
        };
      }
      return null;
    }

    case 'literal_union': {
      if (!ast.values.includes(value)) {
        const expected = ast.values.map((v) => JSON.stringify(v)).join(' | ');
        return {
          message: `Expected one of [${expected}], got ${JSON.stringify(value)}`,
          path,
          expected,
          actual: String(value),
        };
      }
      return null;
    }

    case 'primitive_union': {
      const actual = realType(value, opts);
      if (!ast.names.includes(actual)) {
        const expected = ast.names.join(' | ');
        return {
          message: `Expected ${expected}, got ${actual}`,
          path,
          expected,
          actual,
        };
      }
      return null;
    }

    case 'union': {
      // For unions we report the full set of expected types
      const expected = ast.members.map((m) => m.name ?? m.kind).join(' | ');
      return {
        message: `Expected ${expected}, got ${realType(value, opts)}`,
        path,
        expected,
        actual: realType(value, opts),
      };
    }

    case 'optional': {
      return value === undefined ? null : (
          findError(ast.inner, value, opts, path)
        );
    }

    case 'array': {
      if (!Array.isArray(value)) {
        const actual = realType(value, opts);
        return {
          message: `Expected array, got ${actual}`,
          path,
          expected: 'array',
          actual,
        };
      }
      for (let i = 0; i < value.length; i++) {
        const err = findError(ast.element, value[i], opts, [
          ...path,
          String(i),
        ]);
        if (err) return err;
      }
      return null;
    }

    case 'object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        const actual = realType(value, opts);
        return {
          message: `Expected object, got ${actual}`,
          path,
          expected: 'object',
          actual,
        };
      }
      for (const p of ast.properties) {
        if (!p.optional && !(p.key in value)) {
          return {
            message: `Missing required property "${p.key}"`,
            path: [...path, p.key],
            expected: p.value.kind,
            actual: 'undefined',
          };
        }
        if (p.key in value && value[p.key] !== undefined) {
          const err = findError(p.value, value[p.key], opts, [...path, p.key]);
          if (err) return err;
        }
      }
      return null;
    }

    default:
      return null;
  }
}
