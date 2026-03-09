#!/usr/bin/env bun
import {
  realType,
  T,
} from '../index.js';

const [,, valueStr, schemaStr] = process.argv;

if (!valueStr || !schemaStr) {
  console.error("Usage: bun run src/cli/playground.js <json_value> <schema>");
  process.exit(1);
}

try {
  let value;
  try {
    value = JSON.parse(valueStr);
  }
  catch (err) {
    console.error(`Failed to parse value as JSON. Make sure you use quotes for strings. Error: ${err.message}`);
    process.exit(1);
  }

  const valid = T([schemaStr]).check(value);

  console.log(`Schema: ${schemaStr}`);
  console.log(`Value: ${JSON.stringify(value)}`);
  console.log(`Type: ${realType(value)}`);
  console.log(`Valid: ${valid}`);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
