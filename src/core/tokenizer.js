// Module-scope frozen Set for O(1) single-char punctuation lookup (never reallocated)
const PUNCTUATION = new Set(['|', '?', '[', ']', '{', '}', '(', ')', ':', ',']);

/**
 * Tokenizes a SigilJS schema string into a flat token array.
 *
 * Every token is:
 *   { kind, value, start, end, line, column }
 *
 * Token kinds:
 *   identifier | string literal | number literal | boolean literal |
 *   null literal | newline | eof | and single-char punctuation kinds
 *
 * @param {string} input
 * @returns {Array<{kind: string, value: *, start: number, end: number, line: number, column: number}>}
 */
export function tokenize(input) {
  let pos = 0;
  let line = 1;
  let column = 1;
  const tokens = [];
  const len = input.length;

  function peek() {
    return pos < len ? input[pos] : null;
  }

  function advance() {
    const ch = input[pos++];
    if (ch === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    return ch;
  }

  while (pos < len) {
    const ch = peek();

    // --- Whitespace (space, tab, carriage return — not newline) ---
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      advance();
      continue;
    }

    // --- Newline (significant in object schemas as a property separator) ---
    if (ch === '\n') {
      const p = pos,
        l = line,
        c = column;
      advance();
      tokens.push({
        kind: 'newline',
        value: '\n',
        start: p,
        end: p + 1,
        line: l,
        column: c,
      });
      continue;
    }

    // --- Single-character punctuation (O(1) Set lookup) ---
    if (PUNCTUATION.has(ch)) {
      const p = pos,
        l = line,
        c = column;
      advance();
      tokens.push({
        kind: ch,
        value: ch,
        start: p,
        end: p + 1,
        line: l,
        column: c,
      });
      continue;
    }

    // --- String literals ---
    if (ch === '"' || ch === "'") {
      const quote = advance();
      const p = pos - 1,
        l = line,
        c = column - 1;
      const chars = [];
      let closed = false;
      while (pos < len) {
        const next = advance();
        if (next === quote) {
          closed = true;
          break;
        }
        chars.push(next);
      }
      if (!closed) {
        throw new Error(
          `Unterminated string literal at line ${l}, column ${c}`,
        );
      }
      tokens.push({
        kind: 'string literal',
        value: chars.join(''),
        start: p,
        end: pos,
        line: l,
        column: c,
      });
      continue;
    }

    // --- Number literals (including negative) ---
    if ((ch >= '0' && ch <= '9') || ch === '-') {
      const p = pos,
        l = line,
        c = column;
      const chars = [advance()];
      while (pos < len) {
        const next = peek();
        if ((next >= '0' && next <= '9') || next === '.') {
          chars.push(advance());
        } else {
          break;
        }
      }
      tokens.push({
        kind: 'number literal',
        value: Number(chars.join('')),
        start: p,
        end: pos,
        line: l,
        column: c,
      });
      continue;
    }

    // --- Identifiers (including boolean/null keywords) ---
    if (
      (ch >= 'A' && ch <= 'Z') ||
      (ch >= 'a' && ch <= 'z') ||
      ch === '_' ||
      ch === '$'
    ) {
      const p = pos,
        l = line,
        c = column;
      const chars = [advance()];
      while (pos < len) {
        const next = peek();
        if (
          (next >= 'A' && next <= 'Z') ||
          (next >= 'a' && next <= 'z') ||
          (next >= '0' && next <= '9') ||
          next === '_' ||
          next === '$'
        ) {
          chars.push(advance());
        } else {
          break;
        }
      }
      const str = chars.join('');
      let kind = 'identifier',
        value = str;
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

    throw new Error(
      `Unexpected character "${ch}" at line ${line}, column ${column}`,
    );
  }

  tokens.push({ kind: 'eof', value: '', start: pos, end: pos, line, column });
  return tokens;
}
