import { T } from './index.js';

const jsonStr = process.argv[2];
const sigilStr = process.argv[3];

if (!jsonStr || !sigilStr) {
  console.error("Usage: bun run src/playground.js '<json>' '<sigil>'");
  process.exit(1);
}

let value;
try {
  value = JSON.parse(jsonStr);
} catch (e) {
  console.error('Invalid JSON input:', e.message);
  process.exit(1);
}

let sigil;
try {
  // Simulate template literal call by creating a tagged template strings array mock
  const strings = [sigilStr];
  strings.raw = [sigilStr];
  sigil = T(strings);
} catch (e) {
  console.error('Invalid Sigil schema:', e.message);
  process.exit(1);
}

try {
  sigil.assert(value);
  console.log('✅ Validation passed');
  process.exit(0);
} catch (e) {
  console.error('❌ Validation failed');
  console.error(
    JSON.stringify(
      {
        code: e.code,
        message: e.message,
        path: e.path,
        expected: e.expected,
        actual: e.actual,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
