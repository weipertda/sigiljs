# Quickstart

## Install

Using Bun:

```javascript

bun add sigiljs

```

Using npm:

```javascript

npm install sigiljs

```

---

## Create Your First Sigil

```javascript

import { Sigil } from "sigiljs"

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
