/**
 * Tokenizes a DSL string into raw type fragments
 * @param {string} schema
 * @returns {string[]}
 */
export function tokenize(schema) {
  return schema
    .replace(/\s+/g, '')
    .split(/([|\[\]\?])/)
    .filter(Boolean);
}

/**
 * Parses a DSL string into a TypeAST
 * @param {string} str
 * @returns {TypeAST}
 */
export function parseDSL(str) {
  const tokens = tokenize(str);
  let index = 0;

  function parseType() {
    const token = tokens[index++];

    if (!token) throw new Error('Unexpected end of input');

    //  Literal string
    if (token.startsWith('"') || token.startsWith("'")) {
      return { type: 'literal', value: token.slice(1, -1) };
    }
    if (token === 'string' || token === 'number' || token === 'boolean') {
      return { type: token };
    }
    if (token === '[') {
      const innerType = parseType();
      if (tokens[index++] !== ']')
        throw new Error('Expected closing bracket "]"');
      return { type: 'array', elementType: innerType };
    }
    //  Look ahead for optional type
    if (tokens[index] === '?') {
      index++;
      return { type: 'optional', innerType: parseType() };
    }
    throw new Error(`Unexpected token: ${token}`);
  }

  function parseUnion() {
    const types = [parseType()];
    while (tokens[index] === '|') {
      index++;
      types.push(parseType());
    }
    return types.length > 1 ? { type: 'union', options: types } : types[0];
  }
  return parseUnion();
}

// TypeAST typedef
/**
 * @typedef {Object} TypeAST
 * @property {string} type
 * @property {any=} value
 * @property {TypeAST[]=} options
 * @property {TypeAST=} elementType
 * @property {TypeAST=} innerType
 */
