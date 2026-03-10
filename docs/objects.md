# Object Schemas

SigilJS can describe full object structures.

```javascript

const User = Sigil`
{
  name: string
  age: number
}
`

```

Example:

```javascript

User.check({
  name: "Alex",
  age: 30
})

```

---

## Nested Objects

Sigils support nested structures.

```javascript

const Profile = Sigil`
{
  user: {
    name: string
    email: string
  }
}
`

```
