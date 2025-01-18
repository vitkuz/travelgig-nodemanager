import { describe, it, expect } from 'vitest';
import { getRandomItem } from '../array';

describe('getRandomItem', () => {
  it('should return an item from the array', () => {
    const array = [1, 2, 3, 4, 5];
    const result = getRandomItem(array);
    expect(array).toContain(result);
  });

  it('should work with arrays of different types', () => {
    const numbers = [1, 2, 3];
    const strings = ['a', 'b', 'c'];
    const objects = [{ id: 1 }, { id: 2 }];

    expect(typeof getRandomItem(numbers)).toBe('number');
    expect(typeof getRandomItem(strings)).toBe('string');
    expect(typeof getRandomItem(objects)).toBe('object');
  });

  it('should return undefined for empty array', () => {
    const emptyArray: number[] = [];
    expect(getRandomItem(emptyArray)).toBeUndefined();
  });
});