# Quickstart

## Install

Using Bun:

```javascript

bun add @weipertda/sigiljs

```

Using npm:

```javascript

npm install @weipertda/sigiljs

```

---

## Create Your First Sigil

```javascript

import { Sigil } from "@weipertda/sigiljs"

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

Email.assert(42)

```
