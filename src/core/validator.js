import { parse } from '../dsl/parser.js';
import { compile } from './compiler.js';

const schemaCache = new Map();

export function createValidator(schemaString) {
  let validator = schemaCache.get(schemaString);
  if (!validator) {
    const ast = parse(schemaString);
    const checkFn = compile(ast);
    validator = {
      check: checkFn
    };
    schemaCache.set(schemaString, validator);
  }
  return validator;
}
