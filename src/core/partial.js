export function partial(ast) {
  if (!ast) return ast;

  switch (ast.kind) {
    case 'primitive':
    case 'literal':
    case 'identifier':
      return { ...ast };
      
    case 'array':
      return { kind: 'array', element: partial(ast.element) };
      
    case 'optional': 
      return { kind: 'optional', inner: partial(ast.inner) };
      
    case 'union': {
      const members = ast.members.map(partial);
      
      // Check for literal union fast-path
      if (members.every(m => m.kind === 'literal')) {
        return { 
          kind: 'literal_union', 
          values: members.map(m => m.value) 
        };
      }
      
      // Check for primitive union fast-path (e.g. string | number | boolean)
      if (members.every(m => m.kind === 'primitive')) {
        return {
          kind: 'primitive_union',
          names: members.map(m => m.name)
        };
      }
      
      return { kind: 'union', members };
    }
    
    case 'object': {
      // Object hinting: pre-calculate required vs optional keys
      const properties = ast.properties.map(p => ({
        key: p.key,
        optional: p.optional,
        value: partial(p.value)
      }));
      
      const requiredKeys = properties.filter(p => !p.optional).map(p => p.key);
      const optionalKeys = properties.filter(p => p.optional).map(p => p.key);
      
      return { 
        kind: 'object', 
        properties,
        hints: { requiredKeys, optionalKeys }
      };
    }
    
    default:
      throw new Error(`Unknown AST node kind in partial eval: ${ast.kind}`);
  }
}
