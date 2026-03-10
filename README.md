# SigilJS

Write types. Validate reality.

## What is SigilJS?

SigilJS is a tiny JavaScript library for describing and validating data using **sigils**.

A sigil is a small expression (type expression) that describes what your data should look like.

Sigils are compiled into fast validators, so repeated checks stay efficient.


No TypeScript.

No dependencies.

Just JavaScript.

---

## Installation

```bash

bun add @weipertda/sigiljs

```

– or –

```bash

npm install @weipertda/sigiljs

```

---

### Create a Sigil

```javascript

import { Sigil } from "@weipertda/sigiljs"

const Email = Sigil`string`

```

### Validate a Value

```javascript

Email.check("hello@example.com")
// true

Email.check(42)
// false

```

### Optional Values

Use `?` to mark optional values.

```javascript

const MaybeName = Sigil`string?`

```

Matches:

```javascript

string
undefined

```

---

### Arrays

```javascript

const Tags = Sigil`string[]`

Tags.check(["js", "bun"])
// true

```

---

### Unions

```javascript

const ID = Sigil`string | number`

```

Matches either type.

---

### Object Validation

```javascript

const User = Sigil`
{
  name: string
  age?: number
}
`

```

Optional properties use ` ? `.

---

### Nested Objects

```javascript

const Order = Sigil`
{
  id: string
  customer: {
    name: string
    email: string
  }
  items: {
    name: string
    price: number
  }[]
}
`

```

---

### Runtime Type Detection

SigilJS also provides a better ` typeof `.

```javascript

import { realType } from "@weipertda/sigiljs"

realType([])        // "array"
realType(null)      // "null"
realType(new Map()) // "map"

```

---

## Why SigilJS?

Sigil cleanly solves four problems:

1. JavaScript's native ` typeof ` is inconsistent and too weak for real type work.

```javascript

typeof []
// "object" 😬

```

2. TypeScript solves mostly compile-time problems, often adds friction, and disappears at runtime.

  * TypeScript helps during development, but once your program runs the types are gone.

  * SigilJS solves the runtime side of the problem.

  * Describe your data once, then validate it anywhere.

```typescript

// TypeScript disappears at runtime
const x: string = 123;

// No runtime error

```

3. Existing runtime validation libraries are dependency-heavy, allocation-happy, or ergonomically off.

4. JavaScript lacks a native-feeling type expression system for runtime truth.

---

### Accurate Runtime Types

Replacing the gaps in ` typeof ` — ` realType ` correctly identifies ` null `, ` NaN `, arrays, async and generator functions, maps, sets, and arbitrary custom classes through hooks.

```javascript

import { realType } from '@weipertda/sigiljs';

realType('x');                 // "string"
realType(null);                // "null"
realType(NaN);                 // "nan"
realType([]);                  // "array"
realType(new Map());           // "map"
realType(async function() {}); // "asyncfunction"

```

You can even provide custom override hooks to map instances directly back to nominal strings:

```javascript

realType(myThing, {
  hooks: [ v => v instanceof MyThing ? 'mything' : null ]
}); // "mything"

```

SigilJS solves runtime type validation with a tiny, dependency-free, runtime-native type system.

---

## Documentation

See the [docs/](docs/README.md) folder for full, detailed documentation __(WIP)__.

---

## Examples

See the [examples/](examples/) folder for runnable examples __(WIP)__.

---

## License

MIT

---

## CLI Playground

You can securely test out Sigil validator schemas against JSON inputs directly from your shell:

```bash

bun run src/playground.js '{"name": "Doug"}' '{name: string, age?: number}'
# ✅ Validation passed

```

## Performance Philosophy

SigilJS embraces a Functional Core / Imperative Shell architecture. It takes your schema string, turns it into a typed token stream, drops parse grouping artifacts, flattens branches, optimizes primitive unions, and finally generates a blazingly fast validator closure mapped dynamically from the ground up to minimize allocations on the hot path. Repeated tagged template passes are thoroughly memoized.
