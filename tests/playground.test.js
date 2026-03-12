import { describe, it, expect } from 'bun:test'
import { $ } from 'bun'

describe('CLI Playground', () => {
  it('validates matching data', async () => {
    const { stdout, exitCode } = await $`bun run src/playground/playground.js '{"name": "D"}' '{name: string}'`.quiet();
    expect(exitCode).toBe(0);
    expect(stdout.toString()).toContain('✅ Validation passed');
  })

  it('fails on mismatched data', async () => {
    const { stderr, exitCode } = await $`bun run src/playground/playground.js '{"name": 42}' '{name: string}'`.nothrow().quiet();
    expect(exitCode).toBe(1);
    expect(stderr.toString()).toContain('SIGIL_VALIDATION_FAILED');
  })

  it('fails on invalid JSON', async () => {
    const { stderr, exitCode } = await $`bun run src/playground/playground.js '{"name":}' '{name: string}'`.nothrow().quiet();
    expect(exitCode).toBe(1);
    expect(stderr.toString()).toContain('Invalid JSON');
  })
})
