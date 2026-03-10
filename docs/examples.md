# Examples

SigilJS is useful anywhere JavaScript interacts with unknown data.

Common use cases:

- API response validation
- Request body validation
- Configuration files
- CLI tools
- JSON parsing
- Database results

---

## API Response Validation

```javascript

const ApiResponse = Sigil`
{
  user: {
    id: string
    email: string
  }
}
`

ApiResponse.assert(await response.json())

```

---

## Config Validation

```javascript

const Config = Sigil`
{
  port: number
  host: string
  debug?: boolean
}
`

Config.assert(JSON.parse(configFile))

```

---

## Request Validation

```javascript

const LoginRequest = Sigil`
{
  email: string
  password: string
}
`

LoginRequest.assert(req.body)

```

---

## Validation Methods

Each sigil provides two validation methods.

### check()

Returns a boolean.

```javascript

User.check(data)

```

### assert()

Throws an error if validation fails.

```javascript

User.assert(data)

```
