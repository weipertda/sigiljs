import { tokenize, TokenTypes } from './tokenizer.js';
import { NodeTypes, primitive, literal, union, array, optional, object } from './ast.js';

export function parse(input) {
  const tokens = tokenize(input);
  let current = 0;

  function peek() {
    return tokens[current];
  }

  function consume() {
    return tokens[current++];
  }
  
  function match(type, value) {
    const token = peek();
    if (token.type === type && (value === undefined || token.value === value)) {
      return consume();
    }
    return null;
  }

  function expectToken(type, value) {
    const token = match(type, value);
    if (!token) {
      const p = peek();
      throw new Error(`Expected ${value || type}, got ${p.value} at position ${p.pos}`);
    }
    return token;
  }

  function parsePrimary() {
    const token = peek();
    
    if (match(TokenTypes.STRING)) {
      return literal(token.value);
    }
    
    if (match(TokenTypes.NUMBER)) {
      return literal(token.value);
    }
    
    if (match(TokenTypes.IDENTIFIER)) {
      if (token.value === 'null') {
         return primitive('null');
      }
      return primitive(token.value);
    }
    
    if (match(TokenTypes.PUNCTUATION, '{')) {
      const properties = [];
      while (!match(TokenTypes.PUNCTUATION, '}')) {
        const keyToken = expectToken(TokenTypes.IDENTIFIER);
        const isOptional = !!match(TokenTypes.PUNCTUATION, '?');
        expectToken(TokenTypes.PUNCTUATION, ':');
        const valueNode = parseUnion();
        properties.push({ key: keyToken.value, optional: isOptional, value: valueNode });
        
        match(TokenTypes.PUNCTUATION, ',');
      }
      return object(properties);
    }
    
    throw new Error(`Unexpected token ${token.value} at position ${token.pos}`);
  }

  function parsePostfix() {
    let node = parsePrimary();
    
    while (true) {
      if (match(TokenTypes.PUNCTUATION, '[')) {
        expectToken(TokenTypes.PUNCTUATION, ']');
        node = array(node);
      } else if (match(TokenTypes.PUNCTUATION, '?')) {
        node = optional(node);
      } else {
        break;
      }
    }
    
    return node;
  }

  function parseUnion() {
    const nodes = [parsePostfix()];
    
    while (match(TokenTypes.PUNCTUATION, '|')) {
      nodes.push(parsePostfix());
    }
    
    return nodes.length === 1 ? nodes[0] : union(nodes);
  }

  const ast = parseUnion();
  if (peek().type !== TokenTypes.EOF) {
    throw new Error(`Unexpected token ${peek().value} at position ${peek().pos}, expected EOF`);
  }
  return ast;
}
