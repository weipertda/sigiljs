# Introduction

JavaScript programs constantly deal with data.

API responses.
User input.
Configuration files.
Database records.
JSON payloads.

And the most common question we need to answer is simple:

"Does this data actually match what I expect?"

JavaScript gives us very few tools to answer that question.

` typeof ` is inconsistent:

```javascript

typeof [] // "object"

```

And TypeScript types disappear completely once the code runs.

SigilJS solves the runtime side of the problem.

Instead of writing complex validation logic, you describe the shape of your data using a **sigil**, then validate values against it.
