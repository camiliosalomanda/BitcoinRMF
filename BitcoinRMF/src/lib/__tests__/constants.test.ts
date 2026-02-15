import { describe, it, expect } from 'vitest';
import { VOTE_THRESHOLD } from '../constants';

describe('VOTE_THRESHOLD', () => {
  it('equals 3', () => {
    expect(VOTE_THRESHOLD).toBe(3);
  });

  it('is a number', () => {
    expect(typeof VOTE_THRESHOLD).toBe('number');
  });
});
