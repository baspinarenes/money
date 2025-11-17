import Big from 'big.js';
import { describe, expect, it } from 'vitest';
import { Money } from '../../src/entities/money';
import { RoundStrategy } from '../../src/types';
import {
  add,
  calculateDiscount,
  compare,
  divide,
  multiply,
  round,
  subtract,
  toBig,
} from '../../src/utils/math';

describe('Math Utils tests', () => {
  describe('toBig() tests', () => {
    it.each([
      [100, '100'],
      ['100.50', '100.5'],
      [0, '0'],
      [-100, '-100'],
      ['0.001', '0.001'],
    ])('should convert %s to Big instance', (input, expected) => {
      const result = toBig(input);
      expect(result.toString()).toBe(expected);
    });

    it('should handle Big instance', () => {
      const big = new Big(100);
      const result = toBig(big);
      expect(result).toBe(big);
    });

    it('should handle Money instance', () => {
      const money = new Money(100.50);
      const result = toBig(money);
      expect(result.toString()).toBe('100.5');
    });

    it('should throw error for invalid input', () => {
      expect(() => toBig('invalid' as any)).toThrow();
    });
  });

  describe('add() tests', () => {
    it.each([
      [new Big(100), new Big(50), '150'],
      [new Big(0.1), new Big(0.2), '0.3'],
      [new Big(-100), new Big(50), '-50'],
      [new Big(100), new Big(-50), '50'],
    ])('should add %s and %s to get %s', (a, b, expected) => {
      const result = add(a, b);
      expect(result.toString()).toBe(expected);
    });
  });

  describe('subtract() tests', () => {
    it.each([
      [new Big(100), new Big(50), '50'],
      [new Big(0.3), new Big(0.1), '0.2'],
      [new Big(-100), new Big(50), '-150'],
      [new Big(100), new Big(-50), '150'],
    ])('should subtract %s from %s to get %s', (a, b, expected) => {
      const result = subtract(a, b);
      expect(result.toString()).toBe(expected);
    });
  });

  describe('multiply() tests', () => {
    it.each([
      [new Big(100), new Big(2), '200'],
      [new Big(0.1), new Big(0.2), '0.02'],
      [new Big(-100), new Big(2), '-200'],
      [new Big(100), new Big(0), '0'],
    ])('should multiply %s by %s to get %s', (a, b, expected) => {
      const result = multiply(a, b);
      expect(result.toString()).toBe(expected);
    });
  });

  describe('divide() tests', () => {
    it.each([
      [new Big(100), new Big(2), '50'],
      [new Big(0.1), new Big(0.2), '0.5'],
      [new Big(-100), new Big(2), '-50'],
      [new Big(100), new Big(4), '25'],
    ])('should divide %s by %s to get %s', (a, b, expected) => {
      const result = divide(a, b);
      expect(result.toString()).toBe(expected);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => divide(new Big(100), new Big(0))).toThrow('Division by zero');
    });
  });

  describe('round() tests', () => {
    describe('UP', () => {
      it.each([
        [new Big(100.451), 2, '100.46'],
        [new Big(100.450), 2, '100.45'],
        [new Big(100.449), 2, '100.45'],
        [new Big(-100.451), 2, '-100.46'],
      ])('should round %s up to %d decimals', (value, precision, expected) => {
        const result = round(value, precision, RoundStrategy.UP);
        expect(result.toString()).toBe(expected);
      });
    });

    describe('DOWN', () => {
      it.each([
        [new Big(100.459), 2, '100.45'],
        [new Big(100.450), 2, '100.45'],
        [new Big(100.451), 2, '100.45'],
        [new Big(-100.459), 2, '-100.45'],
      ])('should round %s down to %d decimals', (value, precision, expected) => {
        const result = round(value, precision, RoundStrategy.DOWN);
        expect(result.toString()).toBe(expected);
      });
    });

    describe('NEAREST', () => {
      it.each([
        [new Big(100.455), 2, '100.46'],
        [new Big(100.454), 2, '100.45'],
        [new Big(100.445), 2, '100.45'],
        [new Big(100.435), 2, '100.44'],
      ])('should round %s half up to %d decimals', (value, precision, expected) => {
        const result = round(value, precision, RoundStrategy.NEAREST);
        expect(result.toString()).toBe(expected);
      });
    });

    it('should use default strategy when not specified', () => {
      const result = round(new Big(100.455), 2);
      expect(result.toString()).toBe('100.46'); // NEAREST default
    });
  });

  describe('calculateDiscount() tests', () => {
    it.each([
      [new Big(100), 10, '90'],
      [new Big(100), 25, '75'],
      [new Big(1000), 15, '850'],
      [new Big(100), '10.5', '89.5'],
      [new Big(0), 10, '0'],
    ])('should calculate %s%% discount on %s to get %s', (amount, percentage, expected) => {
      const result = calculateDiscount(amount, percentage);
      expect(result.toString()).toBe(expected);
    });
  });

  describe('compare() tests', () => {
    it.each([
      [new Big(100), new Big(50), 1],
      [new Big(50), new Big(100), -1],
      [new Big(100), new Big(100), 0],
      [new Big(0.1), new Big(0.2), -1],
      [new Big(-100), new Big(-50), -1],
    ])('should compare %s and %s', (a, b, expected) => {
      const result = compare(a, b);
      expect(result).toBe(expected);
    });
  });
});

