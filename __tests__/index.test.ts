import { describe, expect, it } from 'vitest';
import { money, Money } from '../src/index';

describe('Public API tests', () => {
    it('should export money function', () => {
      expect(typeof money).toBe('function');
      expect(money(100)).toBeInstanceOf(Money);
    });

    it('should export Money class', () => {
      expect(Money).toBeDefined();
      expect(typeof Money).toBe('function');
    });

    it('should work end-to-end', () => {
      const result = money(100)
        .add(50)
        .multiply(2)
        .discount(10)
        .format({ locale: 'en-US', currency: 'USD' });
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    describe('Money factory function tests', () => {
      it.each([
        [100],
        ['100.50'],
        [0],
        [-100],
        [100.99],
      ])('should create Money instance from %s', (input) => {
        const result = money(input);
        expect(result).toBeInstanceOf(Money);
      });
  
      it('should create Money from number', () => {
        const result = money(100);
        expect(result.amount).toBe(100);
      });
  
      it('should create Money from string', () => {
        const result = money('100.50');
        expect(result.value).toBe('100.5');
      });
  
      it('should create Money from Money instance', () => {
        const original = money(100);
        const cloned = money(original);
        expect(cloned.value).toBe(original.value);
        expect(cloned).not.toBe(original);
      });
  
      it('should support chainable operations', () => {
        const result = money(100).add(50).multiply(2);
        expect(result.amount).toBe(300);
      });
    });
});

