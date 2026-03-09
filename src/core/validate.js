import { compile } from './compile.js';

export function validate(astOrSigil, value, opts) {
  // Can be called with a raw AST, or a Sigil object possessing `.ast` / `.normalized`
  const targetAst = astOrSigil.normalized || astOrSigil.ast || astOrSigil;
  const check = compile(targetAst);
  return check(value, opts);
}
