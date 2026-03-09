export function tokenize(input) {
  let pos = 0;
  let line = 1;
  let column = 1;
  const tokens = [];

  function peek() {
    return pos < input.length ? input[pos] : null;
  }

  function advance() {
    const ch = peek();
    if (ch === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    pos++;
    return ch;
  }

  while (pos < input.length) {
    const ch = peek();
    
    // whitespace
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      advance();
      continue;
    }

    if (ch === '\n') {
      const p = pos;
      const l = line;
      const c = column;
      advance();
      tokens.push({ kind: 'newline', value: '\n', start: p, end: p + 1, line: l, column: c });
      continue;
    }

    // single-char punctuation
    if (['|', '?', '[', ']', '{', '}', '(', ')', ':', ','].includes(ch)) {
      const p = pos;
      const l = line;
      const c = column;
      advance();
      tokens.push({ kind: ch, value: ch, start: p, end: p + 1, line: l, column: c });
      continue;
    }

    // strings
    if (ch === '"' || ch === "'") {
      const quote = advance();
      const p = pos - 1;
      const l = line;
      const c = column - 1;
      let str = '';
      let closed = false;
      while (pos < input.length) {
        const next = advance();
        if (next === quote) {
          closed = true;
          break;
        }
        str += next;
      }
      if (!closed) {
        throw new Error(`Unterminated string literal at line ${l}, column ${c}`);
      }
      tokens.push({ kind: 'string literal', value: str, start: p, end: pos, line: l, column: c });
      continue;
    }

    // numbers
    if (/[0-9-]/.test(ch)) {
      const p = pos;
      const l = line;
      const c = column;
      let str = advance();
      while (pos < input.length && /[0-9.]/.test(peek())) {
        str += advance();
      }
      // Extremely basic float logic check for NaN would be needed per stricter spec, but Number(str) is fine for MVP.
      const num = Number(str);
      tokens.push({ kind: 'number literal', value: num, start: p, end: pos, line: l, column: c });
      continue;
    }

    // identifiers (including boolean and null keywords)
    if (/[A-Za-z_$]/.test(ch)) {
      const p = pos;
      const l = line;
      const c = column;
      let str = advance();
      while (pos < input.length && /[A-Za-z0-9_$]/.test(peek())) {
        str += advance();
      }
      
      let kind = 'identifier';
      let value = str;
      if (str === 'true' || str === 'false') {
        kind = 'boolean literal';
        value = str === 'true';
      } else if (str === 'null') {
        kind = 'null literal';
        value = null;
      }

      tokens.push({ kind, value, start: p, end: pos, line: l, column: c });
      continue;
    }

    throw new Error(`Unexpected character "${ch}" at line ${line}, column ${column}`);
  }

  tokens.push({ kind: 'eof', value: '', start: pos, end: pos, line, column });
  return tokens;
}
