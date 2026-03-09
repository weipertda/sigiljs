import { NodeTypes } from '../dsl/ast.js';
import { realType } from './realType.js';

export function compile(ast) {
  switch (ast.type) {
    case NodeTypes.PRIMITIVE: {
      const name = ast.data.name;
      if (name === 'any') return () => true;
      return (val) => realType(val) === name;
    }

    case NodeTypes.LITERAL: {
      const lit = ast.data.value;
      return (val) => val === lit;
    }

    case NodeTypes.UNION: {
      const checks = ast.data.types.map(compile);
      return (val) => {
        for (let i = 0; i < checks.length; i++) {
          if (checks[i](val)) return true;
        }
        return false;
      };
    }

    case NodeTypes.ARRAY: {
      const elemCheck = compile(ast.data.element);
      return (val) => {
        if (!Array.isArray(val)) return false;
        for (let i = 0; i < val.length; i++) {
          if (!elemCheck(val[i])) return false;
        }
        return true;
      };
    }

    case NodeTypes.OPTIONAL: {
      const optCheck = compile(ast.data.element);
      return (val) => val === undefined || optCheck(val);
    }

    case NodeTypes.OBJECT: {
      const props = ast.data.properties.map(p => ({
        key: p.key,
        optional: p.optional,
        check: compile(p.value)
      }));
      return (val) => {
        if (realType(val) !== 'object') return false;
        for (let i = 0; i < props.length; i++) {
          const p = props[i];
          const hasKey = p.key in val;
          if (!hasKey) {
            if (!p.optional) return false;
          } else {
            if (!p.check(val[p.key])) return false;
          }
        }
        return true;
      };
    }

    default:
      throw new Error(`Unknown AST node type: ${ast.type}`);
  }
}
