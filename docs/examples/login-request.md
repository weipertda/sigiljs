```javascript
import { Sigil } from 'sigiljs';

const LoginRequest = Sigil`
{
  email: string
  password: string
}
`

LoginRequest.assert(req.body)
```
