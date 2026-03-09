import { expect, test, describe } from "bun:test";
import { realType } from "../src/realType.js";

describe("realType", () => {
  test("primitives", () => {
    expect(realType("hello")).toBe("string");
    expect(realType(42)).toBe("number");
    expect(realType(NaN)).toBe("nan");
    expect(realType(true)).toBe("boolean");
    expect(realType(Symbol("foo"))).toBe("symbol");
    expect(realType(10n)).toBe("bigint");
    expect(realType(undefined)).toBe("undefined");
    expect(realType(null)).toBe("null");
  });

  test("objects", () => {
    expect(realType({})).toBe("object");
    expect(realType(Object.create(null))).toBe("object");
    expect(realType([])).toBe("array");
    expect(realType(new Map())).toBe("map");
    expect(realType(new Set())).toBe("set");
    expect(realType(new Date())).toBe("date");
    expect(realType(/regex/)).toBe("regexp");
    expect(realType(Promise.resolve())).toBe("promise");
  });

  test("functions", () => {
    expect(realType(() => {})).toBe("function");
    expect(realType(async () => {})).toBe("asyncfunction");
    expect(realType(function* () {})).toBe("generatorfunction");
  });

  test("hooks", () => {
    class MyClass {}
    const instance = new MyClass();
    
    expect(realType(instance)).toBe("object");
    
    const result = realType(instance, {
      hooks: [
        v => v instanceof MyClass ? "myclass" : null
      ]
    });
    
    expect(result).toBe("myclass");
  });
});
