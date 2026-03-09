import { assert } from './core/assert.js';
import { compile } from './core/compile.js';
import { normalize } from './core/normalize.js';
import { parse } from './core/parser.js';
import { partial } from './core/partial.js';
import { validate } from './core/validate.js';

export function Sigil(strings, ...values) {
  let raw = strings[0];
  for (let i = 0; i < values.length; i++) {
    raw += values[i] + strings[i + 1];
  }

  const ast = parse(raw);
  const normalized = partial(normalize(ast));

  // Warm up validator cache
  compile(normalized);

  const sigil = {
    raw,
    ast,
    normalized,
    check: (value, opts) => validate(sigil, value, opts),
    assert: (value, opts) => assert(sigil, value, opts),
    compile: () => compile(normalized)
  };

  return sigil;
}
