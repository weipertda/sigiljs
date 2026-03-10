# Sigils

A **sigil** is a small expression that describes what data should look like.

Sigils are written using a tagged template:

```javascript
Sigil`string`
```

Sigils compile into fast runtime validators.

---

## Primitive Types

SigilJS supports common JavaScript primitives.

```javascript
Sigil`string`
Sigil`number`
Sigil`boolean`
Sigil`bigint`
Sigil`symbol`
Sigil`null`
Sigil`undefined`
```

Example:

```javascript
const Name = Sigil`string`

Name.check("Alex")
```

---

## The Sigil Mental Model

The easiest way to think about SigilJS is:

A **sigil is a blueprint for data**.

Example blueprint:

```javascript
const User = Sigil`
{
  name: string
  age?: number
}
`
```

You can then **cast the sigil** against real values.

```javascript
User.check(data)
```
