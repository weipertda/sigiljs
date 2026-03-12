# Quickstart

## Install

Using Bun:

```javascript

bun add @antistructured/sigiljs

```

Using npm:

```javascript

npm install @antistructured/sigiljs

```

---

## Create Your First Sigil

```javascript

import { Sigil } from "@antistructured/sigiljs"

const Email = Sigil`string`

```

This sigil describes any string.

---

## Validate Data

```javascript

Email.check("hello@example.com")
// true

Email.check(42)
// false

```

If you want validation to throw errors instead:

```javascript

try {
  Email.assert(42)
} catch (error) {
  console.log(`
  ${error.message}  // "Expected string, got number"
  ${error.code}     // "SIGIL_VALIDATION_FAILED"
  ${error.path}     // []
  ${error.expected} // "string"
  ${error.actual}   // "number"
`)
}

```
