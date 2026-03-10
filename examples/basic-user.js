import { Sigil } from '../src/index.js';

const User = Sigil`
{
  name: string
  age?: number
  tags: string[]
}
`

const data = {
  name: "Alex",
  tags: ["js", "bun"]
}

console.log(User.check(data))
