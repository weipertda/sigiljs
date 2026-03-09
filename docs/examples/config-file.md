import { Sigil } from 'sigiljs';

const Config = Sigil`
{
  port: number
  host: string
  debug?: boolean
}
`

Config.assert(JSON.parse(file))