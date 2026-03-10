import { Sigil } from '../src/index.js'

const Order = Sigil`
{
  id: string
  customer: {
    name: string
    email: string
  }
  items: {
    name: string
    price: number
  }[]
}
`

const order = {
  id: "123",
  customer: {
    name: "Alex",
    email: "alex@example.com"
  },
  items: [
    { name: "Keyboard", price: 99 }
  ]
}

console.log(Order.check(order))
