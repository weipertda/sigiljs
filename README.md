# SigilJS

Write types. Validate reality.

## What is SigilJS?

> SigilJS is a tiny JavaScript library for describing and validating data using **type sigils**.

No TypeScript.
No dependencies.
Just JavaScript.

---

## Installation

```bash
bun add sigiljs
```

or

```bash
npm install sigiljs
```

---

### Create a Sigil

```javascript
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

## Quick Examples

### Example 1: Object Validation

```javascript
import { Sigil } from 'sigiljs';

const User = Sigil`
{
  name: string
  age?: number
  tags: string[]
}
`

User.check({
  name: 'Alex',
  tags: ['js', 'bun']
})
// true
```

### Example 2: API Response Validation

```javascript
const ApiResponse = Sigil`
{
  user: {
    id: string
    email: string
  }
}
`

ApiResponse.assert(await response.json())
```

### Example 3: realType

```javascript
import { realType } from 'sigiljs';

realType([]) // "array"
realType(null) // "null"
realType(NaN) // "nan"
realType(new Map()) // "map"
realType(async function() {}) // "asyncfunction"
```

---

## Why SigilJS?

Sigil solves four problems cleanly:
1. JavaScript's native `typeof` is inconsistent and too weak for real type work.

```javascript
typeof []
// "object"
```

2. TypeScript solves mostly compile-time problems, often adds friction, and disappears at runtime.

TypeScript helps during development, but once your program runs the types are gone.

SigilJS solves the runtime side of the problem.

Describe your data once, then validate it anywhere.

```typescript
// TypeScript disappears at runtime
const x: string = 123;
// No runtime error
```

3. Existing runtime validation libraries are dependency-heavy, allocation-happy, or ergonomically off.

4. JavaScript lacks a native-feeling type expression system for runtime truth.

### Accurate Runtime Types

Replacing the gaps in `typeof`, `realType` correctly identifies `null`, `NaN`, arrays, async and generator functions, maps, sets, and arbitrary custom classes through hooks.

```javascript
import { realType } from 'sigiljs';

realType('x'); // "string"
realType(null); // "null"
realType(NaN); // "nan"
realType([]); // "array"
realType(new Map()); // "map"
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

See [docs/](docs/README.md) folder for detailed documentation.

[Introduction](docs/introduction.md)
[Getting Started](docs/quickstart.md)
[Sigils](docs/sigils.md)
[Objects](docs/objects.md)
[Arrays](docs/arrays.md)
[Functions](docs/functions.md)
[Maps](docs/maps.md)
[Sets](docs/sets.md)
[Tuples](docs/tuples.md)
[Unions](docs/unions.md)
[Intersection](docs/intersection.md)
[Optional](docs/optional.md)
[Rest](docs/rest.md)
[Examples](docs/examples.md)
[Performance](docs/performance.md)
[Contributing](docs/contributing.md)
[License](docs/license.md)

---

## CLI Playground

You can securely test out Sigil validator schemas against JSON inputs directly from your shell:

```bash
bun run src/playground.js '{"name": "Doug"}' '{name: string, age?: number}'
# ✅ Validation passed
```

## Performance Philosophy

SigilJS embraces a Functional Core / Imperative Shell architecture. It takes your schema string, turns it into a typed token stream, drops parse grouping artifacts, flattens branches, optimizes primitive unions, and finally generates a blazingly fast validator closure mapped dynamically from the ground up to minimize allocations on the hot path. Repeated tagged template passes are thoroughly memoized.
