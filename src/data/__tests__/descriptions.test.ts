import { describe, it, expect } from 'vitest';
import { descriptions } from '../descriptions';

describe('descriptions', () => {
  it('should be an array of detailed text descriptions', () => {
    expect(Array.isArray(descriptions)).toBe(true);
    descriptions.forEach(description => {
      expect(typeof description).toBe('string');
    });
  });

  it('should have meaningful content length', () => {
    descriptions.forEach(description => {
      expect(description.length).toBeGreaterThanOrEqual(50);
      expect(description.length).toBeLessThanOrEqual(500);
    });
  });

  it('should not have duplicate descriptions', () => {
    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBe(descriptions.length);
  });

  it('should contain proper punctuation', () => {
    descriptions.forEach(description => {
      expect(description.endsWith('.')).toBe(true);
      expect(description).toMatch(/^[A-Z]/); // Starts with capital letter
    });
  });

  it('should not contain HTML or markdown', () => {
    descriptions.forEach(description => {
      expect(description).not.toMatch(/<[^>]*>/); // No HTML tags
      expect(description).not.toMatch(/[#*_`]/); // No markdown syntax
    });
  });
});