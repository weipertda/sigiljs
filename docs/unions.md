# Unions

Use `|` to allow multiple types.

```javascript
Sigil`string | number`
```

Example:

```javascript
const ID = Sigil`string | number`

ID.check("abc")
ID.check(123)
```
