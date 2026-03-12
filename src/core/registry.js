/**
 * Global registry for named sigils.
 * Allows sigils to be referenced by name in other sigils.
 */
const registry = new Map();

/**
 * Registers a sigil by name.
 * @param {string} name
 * @param {object} sigil
 */
export function register(name, sigil) {
  if (typeof name !== 'string') {
    throw new Error('Sigil name must be a string');
  }
  registry.set(name, sigil);
}

/**
 * Resolves a sigil by name.
 * @param {string} name
 * @returns {object|undefined}
 */
export function resolve(name) {
  return registry.get(name);
}

/**
 * Clears the registry (mainly for testing).
 */
export function clear() {
  registry.clear();
}
