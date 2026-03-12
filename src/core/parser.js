import { tokenize } from './tokenizer.js';

// Module-scope Set — created once, never reallocated per parse call
const PRIMITIVES = new Set([
  'string',
  'number',
  'boolean',
  'bigint',
  'symbol',
  'undefined',
  'null',
  'object',
  'array',
  'function',
  'any',
  'unknown',
  'never',
]);

/**
 * Parses a SigilJS schema string (or token array) into an AST.
 *
 * Accepts either a raw string input or a pre-tokenized token array
 * (useful for incremental / streaming use cases).
 *
 * AST node shapes:
 *   { kind: 'primitive',  name }
 *   { kind: 'literal',    value, valueType }
 *   { kind: 'union',      members }
 *   { kind: 'array',      element }
 *   { kind: 'optional',   inner }
 *   { kind: 'object',     properties: [{ key, optional, value }], exact }
 *   { kind: 'identifier', name }
 *
 * @param {string|Array} input
 * @param {object} [options]
 * @returns {object} AST node
 */
export function parse(input, options = {}) {
  const tokens = typeof input === 'string' ? tokenize(input) : input;
  let pos = 0;

  function peek() {
    // EOF-safe: always returns last token (which is always 'eof') on overrun
    return pos < tokens.length ? tokens[pos] : tokens[tokens.length - 1];
  }

  function advance() {
    return tokens[pos++];
  }

  function consume(kind, message) {
    const t = peek();
    if (t.kind === kind) return advance();
    throw new Error(
      `${message ?? `Expected "${kind}"`} at line ${t.line}, column ${t.column}`,
    );
  }

  function skipNewlines() {
    while (peek().kind === 'newline') advance();
  }

  // ─── Grammar ──────────────────────────────────────────────────────────────
  //
  // schema     := typeExpr EOF
  // typeExpr   := unionExpr
  // unionExpr  := postfixExpr ('|' postfixExpr)*
  // postfixExpr := primaryExpr ( '[]' | '?' )*
  // primaryExpr := '(' typeExpr ')'
  //             | '{' objectBody '}'
  //             | literal
  //             | identifier
  //
  // ──────────────────────────────────────────────────────────────────────────

  function parseSigil() {
    skipNewlines();
    const type = parseTypeExpr();
    skipNewlines();
    if (peek().kind !== 'eof') {
      const t = peek();
      throw new Error(
        `Unexpected token "${t.value}" at line ${t.line}, column ${t.column}`,
      );
    }
    return type;
  }

  function parseTypeExpr() {
    return parseUnionExpr();
  }

  function parseUnionExpr() {
    const members = [parsePostfixExpr()];
    while (peek().kind === '|') {
      advance(); // consume '|'
      skipNewlines();
      members.push(parsePostfixExpr());
    }
    return members.length === 1 ? members[0] : { kind: 'union', members };
  }

  function parsePostfixExpr() {
    let expr = parsePrimaryExpr();
    while (true) {
      if (peek().kind === '[') {
        advance();
        if (peek().kind !== ']') {
          const t = peek();
          throw new Error(`Expected "]" at line ${t.line}, column ${t.column}`);
        }
        advance();
        expr = { kind: 'array', element: expr };
      } else if (peek().kind === '?') {
        advance();
        expr = { kind: 'optional', inner: expr };
      } else {
        break;
      }
    }
    return expr;
  }

  function parsePrimaryExpr() {
    skipNewlines();
    const t = peek();

    // Grouped expression
    if (t.kind === '(') {
      advance();
      const expr = parseTypeExpr();
      skipNewlines();
      consume(')', 'Expected closing parenthesis');
      return expr;
    }

    // Object type
    if (t.kind === '{') return parseObjectType();

    // Literal types
    if (
      t.kind === 'string literal' ||
      t.kind === 'number literal' ||
      t.kind === 'boolean literal' ||
      t.kind === 'null literal'
    ) {
      advance();
      const valueType =
        t.kind === 'string literal' ? 'string'
        : t.kind === 'number literal' ? 'number'
        : t.kind === 'boolean literal' ? 'boolean'
        : 'null';
      return { kind: 'literal', value: t.value, valueType };
    }

    // Named types (primitives or user-defined identifiers)
    if (t.kind === 'identifier') {
      advance();
      return PRIMITIVES.has(t.value) ?
          { kind: 'primitive', name: t.value }
        : { kind: 'identifier', name: t.value };
    }

    throw new Error(
      `Unexpected token "${t.value}" at line ${t.line}, column ${t.column}`,
    );
  }

  function parseObjectType() {
    consume('{');
    const properties = [];
    skipNewlines();

    while (peek().kind !== '}' && peek().kind !== 'eof') {
      const keyToken = peek();
      if (
        keyToken.kind !== 'identifier' &&
        keyToken.kind !== 'string literal'
      ) {
        throw new Error(
          `Expected property name at line ${keyToken.line}, column ${keyToken.column}`,
        );
      }
      advance();

      const optional = peek().kind === '?' ? (advance(), true) : false;

      const colon = peek();
      if (colon.kind !== ':') {
        throw new Error(
          `Expected ":" after property name at line ${colon.line}, column ${colon.column}`,
        );
      }
      advance();

      skipNewlines();
      const valueExpr = parseTypeExpr();
      properties.push({ key: keyToken.value, optional, value: valueExpr });

      // Separator: comma or newline (both allowed; closing brace ends the loop)
      const sep = peek();
      if (sep.kind === ',') {
        advance();
        skipNewlines();
      } else if (sep.kind === 'newline') {
        skipNewlines();
      } else if (sep.kind !== '}') {
        throw new Error(
          `Expected "," or newline between object properties at line ${sep.line}, column ${sep.column}`,
        );
      }
    }

    consume('}', 'Expected closing block brace');
    return { kind: 'object', properties, exact: !!options.exact };
  }

  return parseSigil();
}
