# Optional Values

Use `?` to allow `undefined`.

```javascript
Sigil`string?`
```

This means the value can be:

- a string
- undefined

Example:

```javascript
const MaybeName = Sigil`string?`

MaybeName.check(undefined)
```

---

## Optional Object Properties

Optional object properties use `?` after the property name.

```javascript
const User = Sigil`
{
  name: string
  age?: number
}
`
```

Example:

```javascript
User.check({ name: "Alex" })
```
