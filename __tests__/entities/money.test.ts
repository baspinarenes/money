import { describe, expect, it } from 'vitest';
import { Money } from '../../src/entities/money';
import { ComparisonResult, RoundStrategy } from '../../src/types';

describe('Money tests', () => {
  describe('Constructor tests', () => {
    it.each([
      [100, '100'],
      ['100.50', '100.5'],
      [0, '0'],
      [-100, '-100'],
      ['0.001', '0.001'],
      [100.99, '100.99'],
    ])('should create Money from %s', (input, expected) => {
      const money = new Money(input);
      expect(money.value).toBe(expected);
    });

    it('should clone Money instance', () => {
      const original = new Money(100);
      const cloned = new Money(original);
      expect(cloned.value).toBe(original.value);
      expect(cloned).not.toBe(original);
    });

    it('should throw error for invalid input', () => {
      expect(() => new Money('invalid' as any)).toThrow();
    });
  });

  describe('Properties tests', () => {
    it('should return correct value', () => {
      const money = new Money(100.50);
      expect(money.value).toBe('100.5');
    });

    it('should return correct amount', () => {
      const money = new Money(100.50);
      expect(money.amount).toBe(100.5);
    });
  });

  describe('Chainable operations tests', () => {
    it('should chain multiple operations', () => {
      const result = new Money(100)
        .add(50)
        .multiply(2)
        .subtract(25)
        .divide(5);
      expect(result.value).toBe('55');
    });

    it('should chain with discount', () => {
      const result = new Money(100)
        .add(50)
        .discount(10)
        .multiply(2);
      expect(result.value).toBe('270');
    });
  });

  describe('add() method tests', () => {
    it.each([
      [100, 50, '150'],
      [100.50, 50.25, '150.75'],
      [100, -50, '50'],
      [-100, 50, '-50'],
      [0, 100, '100'],
      [100, '50', '150'],
      [100, new Money(50), '150'],
    ])('should add %s and %s to get %s', (a, b, expected) => {
      const money = new Money(a);
      const result = money.add(b);
      expect(result.value).toBe(expected);
      expect(result).not.toBe(money); // Immutable
    });
  });

  describe('subtract() method tests', () => {
    it.each([
      [100, 50, '50'],
      [100.50, 50.25, '50.25'],
      [100, -50, '150'],
      [-100, 50, '-150'],
      [0, 100, '-100'],
      [100, '50', '50'],
      [100, new Money(50), '50'],
    ])('should subtract %s from %s to get %s', (a, b, expected) => {
      const money = new Money(a);
      const result = money.subtract(b);
      expect(result.value).toBe(expected);
    });
  });

  describe('multiply() method tests', () => {
    it.each([
      [100, 2, '200'],
      [100.50, 2, '201'],
      [100, 0, '0'],
      [100, -2, '-200'],
      [-100, 2, '-200'],
      [100, '1.5', '150'],
      [100, 0.5, '50'],
    ])('should multiply %s by %s to get %s', (a, factor, expected) => {
      const money = new Money(a);
      const result = money.multiply(factor);
      expect(result.value).toBe(expected);
    });
  });

  describe('divide() method tests', () => {
    it.each([
      [100, 2, '50'],
      [100.50, 2, '50.25'],
      [100, 4, '25'],
      [-100, 2, '-50'],
      [100, '2', '50'],
      [100, 0.5, '200'],
    ])('should divide %s by %s to get %s', (a, divisor, expected) => {
      const money = new Money(a);
      const result = money.divide(divisor);
      expect(result.value).toBe(expected);
    });

    it('should throw error when dividing by zero', () => {
      const money = new Money(100);
      expect(() => money.divide(0)).toThrow('Division by zero');
    });
  });

  describe('round() method tests', () => {
    it.each([
      [100.456, 2, RoundStrategy.NEAREST, '100.46'],
      [100.454, 2, RoundStrategy.NEAREST, '100.45'],
      [100.456, 2, RoundStrategy.UP, '100.46'],
      [100.451, 2, RoundStrategy.UP, '100.46'],
      [100.459, 2, RoundStrategy.DOWN, '100.45'],
      [100.451, 2, RoundStrategy.DOWN, '100.45'],
    ])('should round %s to %d decimals using %s', (value, precision, strategy, expected) => {
      const money = new Money(value);
      const result = money.round(precision, strategy);
      expect(result.value).toBe(expected);
    });

    it('should use default precision and strategy when not provided', () => {
      const money = new Money(100.456);
      const result = money.round();
      expect(result.value).toBe('100.46'); // Default: 2 decimals, ROUND_HALF_UP
    });
  });

  describe('discount() method tests', () => {
    it.each([
      [100, 10, '90'],
      [100, 25, '75'],
      [1000, 15, '850'],
      [100, '10.5', '89.5'],
      [0, 10, '0'],
    ])('should apply %s%% discount to %s to get %s', (value, percentage, expected) => {
      const money = new Money(value);
      const result = money.discount(percentage);
      expect(result.value).toBe(expected);
    });
  });

  describe('equal() method tests', () => {
    it.each([
      [100, 100, true],
      [100, 50, false],
      [100.50, 100.50, true],
      [100, '100', true],
      [100, new Money(100), true],
      [0, 0, true],
      [-100, -100, true],
    ])('should check if %s equals %s', (a, b, expected) => {
      const money = new Money(a);
      expect(money.equal(b)).toBe(expected);
    });
  });

  describe('compare() method tests', () => {
    it.each([
      [100, 50, ComparisonResult.GREATER_THAN],
      [50, 100, ComparisonResult.LESS_THAN],
      [100, 100, ComparisonResult.EQUAL],
      [0, 0, ComparisonResult.EQUAL],
      [-100, -50, ComparisonResult.LESS_THAN],
    ])('should compare %s and %s', (a, b, expected) => {
      const money = new Money(a);
      expect(money.compare(b)).toBe(expected);
    });
  });

  describe('isZero() method tests', () => {
    it.each([
      [0, true],
      [100, false],
      [-100, false],
      ['0', true],
    ])('should check if %s is zero', (value, expected) => {
      const money = new Money(value);
      expect(money.isZero()).toBe(expected);
    });
  });

  describe('isPositive() method tests', () => {
    it.each([
      [100, true],
      [0, false],
      [-100, false],
      [0.01, true],
    ])('should check if %s is positive', (value, expected) => {
      const money = new Money(value);
      expect(money.isPositive()).toBe(expected);
    });
  });

  describe('isNegative() method tests', () => {
    it.each([
      [-100, true],
      [0, false],
      [100, false],
      [-0.01, true],
    ])('should check if %s is negative', (value, expected) => {
      const money = new Money(value);
      expect(money.isNegative()).toBe(expected);
    });
  });

  describe('abs() method tests', () => {
    it.each([
      [100, '100'],
      [-100, '100'],
      [0, '0'],
      [-100.50, '100.5'],
    ])('should get absolute value of %s', (value, expected) => {
      const money = new Money(value);
      const result = money.abs();
      expect(result.value).toBe(expected);
    });
  });

  describe('negate() method tests', () => {
    it.each([
      [100, '-100'],
      [-100, '100'],
      [0, '0'],
      [100.50, '-100.5'],
    ])('should negate %s', (value, expected) => {
      const money = new Money(value);
      const result = money.negate();
      expect(result.value).toBe(expected);
    });
  });

  describe('toNumber() method tests', () => {
    it.each([
      [100, 100],
      [100.50, 100.5],
      [0, 0],
      [-100, -100],
    ])('should convert %s to number', (value, expected) => {
      const money = new Money(value);
      expect(money.toNumber()).toBe(expected);
    });
  });

  describe('toString() method tests', () => {
    it.each([
      [100, '100'],
      [100.50, '100.5'],
      [0, '0'],
    ])('should convert %s to string', (value, expected) => {
      const money = new Money(value);
      expect(money.toString()).toBe(expected);
    });
  });

  describe('toJSON() method tests', () => {
    it('should return string representation', () => {
      const money = new Money(100.50);
      expect(money.toJSON()).toBe('100.5');
    });
  });
});

