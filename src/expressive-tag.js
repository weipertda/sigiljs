import { validate } from '@/validate.js'

export function T (strings, ...values) {
  const schema = strings.join('')
  return (value, options = {}) => validate(value, schema, options)
}
