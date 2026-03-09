# Arrays

```javascript
T`number[]`
```

Matches arrays containing numbers.

---

```javascript
T`[string, number]`
```

Matches arrays containing a string followed by a number.

---

```javascript
T`[string, number, ...boolean[]]`
```

Matches arrays containing a string, a number, and then any number of booleans.

---

```javascript
const User = T`{
  name: string
  age: number
  tags: string[]
}
```
Matches objects with the properties: name, age, and tags, whose values must be a string, a number, and an array of strings, respectively.


```javascript
User.check({ name: 'Doug', age: 42, tags: ['js'] }); // true
```
---
