export function realType(value, options) {
  if (options !== undefined && options.hooks !== undefined) {
    const hooks = options.hooks;
    for (let i = 0; i < hooks.length; i++) {
      const res = hooks[i](value);
      if (res !== null && res !== undefined) return res;
    }
  }

  if (value === null) return 'null';
  
  const type = typeof value;
  
  if (type === 'object') {
    if (Array.isArray(value)) return 'array';
    if (value instanceof RegExp) return 'regexp';
    if (value instanceof Date) return 'date';
    if (value instanceof Promise) return 'promise';
    if (value instanceof Set) return 'set';
    if (value instanceof Map) return 'map';
    return 'object';
  }
  
  if (type === 'number') {
    return Number.isNaN(value) ? 'nan' : 'number';
  }
  
  if (type === 'function') {
    const name = value.constructor.name;
    if (name === 'AsyncFunction') return 'asyncfunction';
    if (name === 'GeneratorFunction') return 'generatorfunction';
    return 'function';
  }
  
  return type;
}
