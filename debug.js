import { tokenize } from './src/core/tokenizer.js'
import { parse } from './src/core/parser.js'

console.log("Tokenizing...");
console.log("empty object:", tokenize("{}"));

console.log("Tokenizing obj 2...");
const t2 = tokenize("{ name: string, age?: number }");
console.log("parsed:", JSON.stringify(parse(t2), null, 2));

console.log("DONE!");
