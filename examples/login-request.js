import { Sigil } from '../src/index.js'

const LoginRequest = Sigil`
{
  email: string
  password: string
}
`

function login(body) {
  LoginRequest.assert(body)

  console.log("Login request valid")
}

login({
  email: "hello@example.com",
  password: "secret"
})
