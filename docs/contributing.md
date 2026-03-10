# Contributing

First off, thank you for considering contributing to SigilJS.

## Local Development

SigilJS uses [Bun](https://bun.sh) for package management and testing.

1. Clone the repository:
   ```bash

   git clone https://github.com/weipertda/sigiljs.git
   cd sigiljs

   ```

2. Install dependencies:

   ```bash

   bun install

   ```

3. Run the tests:

   ```bash

   bun test

   ```

## Pull Requests

1. **Create a branch** for your feature or bugfix.
2. **Write tests** that prove your bug was fixed or your feature works.
3. **Format your code** using `bun run format`.
4. **Ensure all tests pass** with `bun test`.
5. Submit your PR with a clear description of the problem and your solution.

## Code Style

SigilJS keeps things simple and avoids dependencies where possible. If you're adding a feature, consider if it really belongs in the core library or if it can be built in user-land using existing sigils.
