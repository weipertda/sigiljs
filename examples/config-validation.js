import { Sigil } from '../src/index.js'
import fs from 'fs'

const Config = Sigil`
{
  port: number
  host: string
  debug?: boolean
}
`

const config = JSON.parse(
  fs.readFileSync("./config.json", "utf8")
)

Config.assert(config)

console.log("Config valid")
