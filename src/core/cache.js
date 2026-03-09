export const validatorCache = new Map();

export function canonicalize(ast) {
  // A fast and structurally stable canonicalization for caching compiled validators.
  // Because JSON.stringify preserves key order from our normalization phase.
  return JSON.stringify(ast);
}
