import { describe, it, expect } from 'vitest';
import { scoreUpdateSchema, voteInputSchema } from '../validators';

// --- scoreUpdateSchema ---

describe('scoreUpdateSchema', () => {
  it('accepts valid likelihood score', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'likelihood', value: 3, reason: 'test' });
    expect(result.success).toBe(true);
  });

  it('accepts valid impact score', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'impact', value: 5, reason: 'test' });
    expect(result.success).toBe(true);
  });

  it('rejects likelihood of 0 (min is 1)', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'likelihood', value: 0, reason: 'test' });
    expect(result.success).toBe(false);
  });

  it('rejects likelihood of 6 (max is 5)', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'likelihood', value: 6, reason: 'test' });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer likelihood', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'likelihood', value: 2.5, reason: 'test' });
    expect(result.success).toBe(false);
  });

  it('accepts valid fair_vulnerability score', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'fair_vulnerability', value: 0.5, reason: 'test' });
    expect(result.success).toBe(true);
  });

  it('rejects fair_vulnerability above 1', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'fair_vulnerability', value: 1.5, reason: 'test' });
    expect(result.success).toBe(false);
  });

  it('rejects fair_vulnerability below 0', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'fair_vulnerability', value: -0.1, reason: 'test' });
    expect(result.success).toBe(false);
  });

  it('accepts non-negative value for other fields (e.g. fair_tef)', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'fair_tef', value: 100, reason: 'test' });
    expect(result.success).toBe(true);
  });

  it('rejects negative value for other fields', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'fair_tef', value: -1, reason: 'test' });
    expect(result.success).toBe(false);
  });

  it('rejects missing reason', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'likelihood', value: 3 });
    expect(result.success).toBe(false);
  });

  it('rejects empty reason', () => {
    const result = scoreUpdateSchema.safeParse({ field: 'likelihood', value: 3, reason: '' });
    expect(result.success).toBe(false);
  });
});

// --- voteInputSchema ---

describe('voteInputSchema', () => {
  it('accepts valid upvote', () => {
    const result = voteInputSchema.safeParse({ targetType: 'threat', targetId: 'abc', voteValue: 1 });
    expect(result.success).toBe(true);
  });

  it('accepts valid downvote', () => {
    const result = voteInputSchema.safeParse({ targetType: 'fud', targetId: 'xyz', voteValue: -1 });
    expect(result.success).toBe(true);
  });

  it('rejects voteValue of 0', () => {
    const result = voteInputSchema.safeParse({ targetType: 'threat', targetId: 'abc', voteValue: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects voteValue of 2', () => {
    const result = voteInputSchema.safeParse({ targetType: 'threat', targetId: 'abc', voteValue: 2 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid targetType', () => {
    const result = voteInputSchema.safeParse({ targetType: 'bip', targetId: 'abc', voteValue: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects empty targetId', () => {
    const result = voteInputSchema.safeParse({ targetType: 'threat', targetId: '', voteValue: 1 });
    expect(result.success).toBe(false);
  });
});
