import { realType } from '../src/index.js'

console.log(realType([]))
console.log(realType(null))
console.log(realType(new Map()))
console.log(realType(new Date()))
