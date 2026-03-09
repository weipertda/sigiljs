# Unions

```javascript
T`string | number`
```

Matches either type.

---

```javascript
T`{ name: string } | { age: number }`
```

Matches objects with either a name or an age shape, or both.

---

```javascript
T`string | { name: string }`
```

Matches either a string or an object with a name property.

---
