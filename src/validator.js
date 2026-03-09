// A registry of built-in type validators
const builtInValidators = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number',
  boolean: (value) => typeof value === 'boolean',
  bigint: value => typeof value === 'bigint',
  symbol: value => typeof value === 'symbol',
  function: value => typeof value === 'function',
  object: value => value !== null && typeof value === 'object',
  undefined: value => value === undefined,
  null: value => value === null,
  any: () => true
}

//  Validates a value based on AST node
function validateNode (astNode, value, customHooks = {}) {
  const { type, optional } = astNode
  const validator = customHooks[type] || builtInValidators[type] || (() => false)

  // Handle optional
  if (optional && (value === undefined || value === null)) return true

  return validator(value)
}

//  Main validator function
export function validate (ast, value, options = {}) {
  if (!ast || typeof ast !== 'object') throw new TypeError('Invalid AST type input')

  return validateNode(ast, value, options.customHooks || {})
}
