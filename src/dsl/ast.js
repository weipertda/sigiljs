export const NodeTypes = {
  LITERAL: 1,      // value: string | number
  PRIMITIVE: 2,    // name: 'string' | 'number' ...
  UNION: 3,        // types: Node[]
  ARRAY: 4,        // element: Node
  OPTIONAL: 5,     // element: Node
  OBJECT: 6,       // properties: Array<{key, value: Node, optional: boolean}>
  TUPLE: 7         // elements: Node[]
};

export const createNode = (type, data) => ({ type, data });

// Helpers
export const primitive = (name) => createNode(NodeTypes.PRIMITIVE, { name });
export const literal = (value) => createNode(NodeTypes.LITERAL, { value });
export const union = (types) => createNode(NodeTypes.UNION, { types });
export const array = (element) => createNode(NodeTypes.ARRAY, { element });
export const optional = (element) => createNode(NodeTypes.OPTIONAL, { element });
export const object = (properties) => createNode(NodeTypes.OBJECT, { properties });
