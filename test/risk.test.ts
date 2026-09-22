import { describe, expect, it } from 'vitest';
import { assessTransaction } from '../src/risk.js';
import { SolamiBlurStream } from '../src/solami.js';

describe('assessTransaction', () => {
  it('passes a small transaction without risk signals', () => {
    const result = assessTransaction({ signature: 'a'.repeat(64), slot: 1, accountKeys: [], programIds: [], writableAccounts: [] });
    expect(result.decision).toBe('PASS');
  });

  it('warns on large SOL movement', () => {
    const result = assessTransaction({ signature: 'a'.repeat(64), slot: 1, accountKeys: [], programIds: ['11111111111111111111111111111111'], writableAccounts: [], lamportsMoved: 10_000_000_001 });
    expect(result.decision).toBe('WARN');
  });

  it('blocks failed transactions', () => {
    const result = assessTransaction({ signature: 'a'.repeat(64), slot: 1, accountKeys: [], programIds: [], writableAccounts: [], error: '{"InstructionError":[0,"Custom"]}' });
    expect(result.decision).toBe('BLOCK');
  });

  it('does not claim Solami is configured without a key', () => {
    const status = new SolamiBlurStream('', 'wss://example.invalid').getStatus();
    expect(status.configured).toBe(false);
    expect(status.connected).toBe(false);
  });
});
