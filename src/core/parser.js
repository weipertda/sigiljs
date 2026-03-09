import { tokenize } from './tokenizer.js';

export function parse(input) {
  const tokens = typeof input === 'string' ? tokenize(input) : input;
  let pos = 0;

  function peek() {
    return pos < tokens.length ? tokens[pos] : tokens[tokens.length - 1]; // EOF fallback
  }

  function advance() {
    return tokens[pos++];
  }

  function consume(kind, message) {
    const t = peek();
    if (t.kind === kind) {
      return advance();
    }
    throw new Error(`${message || `Expected "${kind}"`} at line ${t.line}, column ${t.column}`);
  }

  function skipNewlines() {
    while (peek().kind === 'newline') advance();
  }

  function parseSigil() {
    skipNewlines();
    const type = parseTypeExpr();
    skipNewlines();
    if (peek().kind !== 'eof') {
      const t = peek();
      throw new Error(`Unexpected token "${t.value}" at line ${t.line}, column ${t.column}`);
    }
    return type;
  }

  function parseTypeExpr() {
    return parseUnionExpr();
  }

  function parseUnionExpr() {
    const members = [parsePostfixExpr()];
    while (true) {
      if (peek().kind === '|') {
        advance(); // consume '|'
        skipNewlines();
        members.push(parsePostfixExpr());
      } else {
        break;
      }
    }
    if (members.length === 1) return members[0];
    return { kind: 'union', members };
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

    if (t.kind === '(') {
      advance(); // consume '('
      const expr = parseTypeExpr();
      skipNewlines();
      consume(')', 'Expected closing parenthesis');
      return expr;
    }

    if (t.kind === '{') {
      return parseObjectType();
    }

    if (t.kind === 'string literal' || t.kind === 'number literal' || t.kind === 'boolean literal' || t.kind === 'null literal') {
      advance();
      const valueType = t.kind === 'string literal' ? 'string' 
        : t.kind === 'number literal' ? 'number'
        : t.kind === 'boolean literal' ? 'boolean'
        : 'null';
      return { kind: 'literal', value: t.value, valueType };
    }

    if (t.kind === 'identifier') {
      advance();
      const primitives = ['string', 'number', 'boolean', 'bigint', 'symbol', 'undefined', 'null', 'object', 'array', 'function', 'any', 'unknown', 'never'];
      if (primitives.includes(t.value)) {
        return { kind: 'primitive', name: t.value };
      }
      return { kind: 'identifier', name: t.value };
    }

    throw new Error(`Unexpected token "${t.value}" at line ${t.line}, column ${t.column}`);
  }

  function parseObjectType() {
    consume('{');
    const properties = [];
    skipNewlines();
    
    while (peek().kind !== '}' && peek().kind !== 'eof') {
      const keyToken = peek();
      if (keyToken.kind !== 'identifier' && keyToken.kind !== 'string literal') {
        throw new Error(`Expected property name at line ${keyToken.line}, column ${keyToken.column}`);
      }
      advance(); // consume key
      
      let optional = false;
      if (peek().kind === '?') {
        optional = true;
        advance();
      }

      const colon = peek();
      if (colon.kind !== ':') {
        throw new Error(`Expected ":" after property name at line ${colon.line}, column ${colon.column}`);
      }
      advance(); // consume ':'

      skipNewlines();
      const valueExpr = parseTypeExpr();
      properties.push({
        key: keyToken.value,
        optional,
        value: valueExpr
      });

      // Seperator: ',' or newline
      const sep = peek();
      if (sep.kind === ',') {
        advance();
        skipNewlines();
      } else if (sep.kind === 'newline') {
        skipNewlines();
      } else if (sep.kind !== '}') {
        throw new Error(`Expected "," or newline between object properties at line ${sep.line}, column ${sep.column}`);
      }
    }
    
    consume('}', 'Expected closing block brace');
    return { kind: 'object', properties };
  }

  return parseSigil();
}
