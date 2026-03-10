# Arrays

Use ` [] ` to describe arrays.

```javascript

Sigil`number[]`

```

Example:

```javascript

const Scores = Sigil`number[]`

Scores.check([10, 20, 30])

```

---

Nested arrays are also supported.

```javascript

Sigil`string[][]`

```

---

## Arrays of Objects

```javascript

const Orders = Sigil`
{
  id: string
  items: {
    name: string
    price: number
  }[]
}
`

```

Example:

```javascript

Orders.check(data)

```
