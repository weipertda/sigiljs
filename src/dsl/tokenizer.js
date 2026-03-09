export const TokenTypes = {
  IDENTIFIER: 1,
  STRING: 2,
  NUMBER: 3,
  PUNCTUATION: 4,
  EOF: 5
};

export function tokenize(input) {
  const tokens = [];
  let i = 0;
  const len = input.length;

  while (i < len) {
    let char = input[i];

    // Skip whitespace
    if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
      i++;
      continue;
    }

    // Punctuation
    if (char === '|' || char === '[' || char === ']' || char === '?' || char === '{' || char === '}' || char === ':' || char === ',') {
      tokens.push({ type: TokenTypes.PUNCTUATION, value: char, pos: i });
      i++;
      continue;
    }

    // Strings
    if (char === '"' || char === "'") {
      const quote = char;
      let str = "";
      i++;
      while (i < len && input[i] !== quote) {
        str += input[i];
        i++;
      }
      tokens.push({ type: TokenTypes.STRING, value: str, pos: i });
      i++; // Skip closing quote
      continue;
    }

    // Numbers
    if (char >= '0' && char <= '9' || char === '-') {
      let numStr = "";
      while (i < len && (input[i] >= '0' && input[i] <= '9' || input[i] === '.' || input[i] === '-')) {
        numStr += input[i];
        i++;
      }
      tokens.push({ type: TokenTypes.NUMBER, value: Number(numStr), pos: i });
      continue;
    }

    // Identifiers
    if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_') {
      let id = "";
      while (i < len && ((input[i] >= 'a' && input[i] <= 'z') || (input[i] >= 'A' && input[i] <= 'Z') || input[i] === '_' || (input[i] >= '0' && input[i] <= '9'))) {
        id += input[i];
        i++;
      }
      tokens.push({ type: TokenTypes.IDENTIFIER, value: id, pos: i });
      continue;
    }

    throw new Error(`Unexpected character at position ${i}: ${char}`);
  }

  tokens.push({ type: TokenTypes.EOF, value: null, pos: i });
  return tokens;
}
