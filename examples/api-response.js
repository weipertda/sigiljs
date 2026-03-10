import { Sigil } from '../src/index.js'

const ApiResponse = Sigil`
{
  user: {
    id: string
    email: string
  }
}
`

async function main() {
  const response = await fetch("https://example.com/api/user")
  const data = await response.json()

  ApiResponse.assert(data)

  console.log("Valid response")
}

main()
