const toStr = Object.prototype.toString;

export function realType(value, options) {
  if (options && options.hooks) {
    const hooks = options.hooks;
    for (let i = 0; i < hooks.length; i++) {
      const res = hooks[i](value);
      if (res != null) return res;
    }
  }

  if (value === null) return 'null';

  const t = typeof value;
  if (t !== 'object' && t !== 'function') {
    if (t === 'number' && Number.isNaN(value)) return 'nan';
    return t;
  }

  if (t === 'function') {
    const str = toStr.call(value);
    if (str === '[object AsyncFunction]') return 'asyncfunction';
    if (str === '[object GeneratorFunction]') return 'generatorfunction';
    return 'function';
  }

  if (Array.isArray(value)) return 'array';

  const str = toStr.call(value);
  if (str === '[object Date]') return 'date';
  if (str === '[object RegExp]') return 'regexp';
  if (str === '[object Map]') return 'map';
  if (str === '[object Set]') return 'set';
  if (str === '[object Promise]') return 'promise';

  return 'object';
}
