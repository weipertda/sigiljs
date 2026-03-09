export function normalize(ast) {
  if (!ast) return ast;

  switch (ast.kind) {
    case 'primitive':
    case 'literal':
    case 'identifier':
      return { ...ast };
      
    case 'array':
      return { kind: 'array', element: normalize(ast.element) };
      
    case 'optional': {
      // If we want to lower 'string?' here, or maybe in partial evaluation.
      // Normalization is pure AST layout formatting.
      const inner = normalize(ast.inner);
      // Optional of optional collapses: string?? -> string?
      if (inner.kind === 'optional') return inner;
      return { kind: 'optional', inner };
    }
      
    case 'union': {
      const flat = [];
      const flatten = (node) => {
        if (node.kind === 'union') {
          node.members.forEach(flatten);
        } else {
          flat.push(normalize(node));
        }
      };
      
      ast.members.forEach(flatten);
      
      // We could deduplicate here, but pure flattening is sufficient for now.
      if (flat.length === 1) return flat[0];
      return { kind: 'union', members: flat };
    }
    
    case 'object': {
      // "preserve property order in objects"
      const properties = ast.properties.map(p => ({
        key: p.key,
        optional: p.optional,
        value: normalize(p.value)
      }));
      return { kind: 'object', properties };
    }
    
    default:
      throw new Error(`Unknown AST node kind: ${ast.kind}`);
  }
}
