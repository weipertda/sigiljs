import { realType } from '@/realType.js'

// VERY basic tokenizer (for now) - extend this later
function tokenize (tokens) {
  return tokens.split('|').map((token) => token.trim())
}

export function createValidationSchema (dslString) {
  const tokens = tokenize(dslString)
  return tokens.map((token) => {
    if (token.endsWith('[]')) return { type: token.slice(0, -2), isArray: true }
    return { type: token, isArray: false }
  })
}

export function validateSchema (value, schema, options = {}) {
  const parsedSchema = createValidationSchema(schema)
  const type = realType(value, options)

  for (const rule of parsedSchema) {
    if (rule.isArray && Array.isArray(value)) {
      const itemTypes = value.map((item) => realType(item, options))
      if (itemTypes.every((itemType) => itemType === rule.type)) return true
    }

    if (!rule.isArray && type === rule.type) return true

    return false
  }
}
