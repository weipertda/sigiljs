# realType

SigilJS includes ` realType() `, which improves on JavaScript's ` typeof `.

```javascript

import { realType } from "sigiljs"

realType([])         // "array"
realType(null)       // "null"
realType(new Map())  // "map"
realType(new Date()) // "date"

```

This is especially useful when building validation or debugging tools.
