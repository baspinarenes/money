import Big from 'big.js';
import { MoneyFormatter } from '../formatters/money-formatter';
import {
  ComparisonResult,
  FormatOptions,
  FormatPart,
  MoneyInput,
  RoundStrategy,
} from '../types';
import {
  add as addBig,
  calculateDiscount,
  compare as compareBig,
  divide as divideBig,
  multiply as multiplyBig,
  round,
  subtract as subtractBig,
  toBig,
} from '../utils/math';

/**
 * Money Value Object
 * Value Object Pattern: Immutable, equality by value, no identity
 * Builder Pattern: Chainable operations for fluent API
 */
export class Money {
  private readonly _value: Big;

  /**
   * Create a new Money instance
   * @param value - Number, string, or Money instance
   */
  constructor(value: MoneyInput) {
    if (value instanceof Money) {
      this._value = value._value;
    } else {
      try {
        this._value = toBig(value);
      } catch (error) {
        throw new Error(`Invalid money value: ${value}. ${error instanceof Error ? error.message : ''}`);
      }
    }
  }

  /**
   * Get the internal Big value as string
   */
  get value(): string {
    return this._value.toString();
  }

  /**
   * Get the numeric amount
   */
  get amount(): number {
    return this._value.toNumber();
  }

  /**
   * Add another money value
   * Returns new Money instance (immutable)
   */
  add(other: MoneyInput): Money {
    const otherBig = other instanceof Money ? other._value : toBig(other);
    const result = addBig(this._value, otherBig);
    return new Money(result.toString());
  }

  /**
   * Subtract another money value
   * Returns new Money instance (immutable)
   */
  subtract(other: MoneyInput): Money {
    const otherBig = other instanceof Money ? other._value : toBig(other);
    const result = subtractBig(this._value, otherBig);
    return new Money(result.toString());
  }

  /**
   * Multiply by a factor
   * Returns new Money instance (immutable)
   */
  multiply(factor: number | string): Money {
    const factorBig = toBig(factor);
    const result = multiplyBig(this._value, factorBig);
    return new Money(result.toString());
  }

  /**
   * Divide by a divisor
   * Returns new Money instance (immutable)
   * @throws Error if divisor is zero
   */
  divide(divisor: number | string): Money {
    const divisorBig = toBig(divisor);
    const result = divideBig(this._value, divisorBig);
    return new Money(result.toString());
  }

  /**
   * Round to specified precision
   * Returns new Money instance (immutable)
   */
  round(precision?: number, roundingStrategy?: RoundStrategy): Money {
    if (!precision) {
      // Default: round to 2 decimal places using banker's rounding
      precision = 2;
      roundingStrategy = RoundStrategy.UP;
    }

    const rounded = round(this._value, precision, roundingStrategy);
    return new Money(rounded.toString());
  }

  /**
   * Apply percentage discount
   * Returns new Money instance (immutable)
   */
  discount(percentage: number | string): Money {
    const result = calculateDiscount(this._value, percentage);
    return new Money(result.toString());
  }

  /**
   * Check if equal to another money value
   */
  equal(other: MoneyInput): boolean {
    const otherBig = other instanceof Money ? other._value : toBig(other);
    return this._value.eq(otherBig);
  }

  /**
   * Compare with another money value
   * Returns ComparisonResult enum
   */
  compare(other: MoneyInput): ComparisonResult {
    const otherBig = other instanceof Money ? other._value : toBig(other);
    const result = compareBig(this._value, otherBig);
    return result as ComparisonResult;
  }

  /**
   * Check if value is zero
   */
  isZero(): boolean {
    return this._value.eq(0);
  }

  /**
   * Check if value is positive
   */
  isPositive(): boolean {
    return this._value.gt(0);
  }

  /**
   * Check if value is negative
   */
  isNegative(): boolean {
    return this._value.lt(0);
  }

  /**
   * Get absolute value
   * Returns new Money instance (immutable)
   */
  abs(): Money {
    return new Money(this._value.abs().toString());
  }

  /**
   * Negate the value
   * Returns new Money instance (immutable)
   */
  negate(): Money {
    return new Money(this._value.times(-1).toString());
  }

  /**
   * Format to string
   * Uses Intl API with zero-config support
   */
  format(options: FormatOptions = {}): string {
    const { precision, roundingStrategy } = options;

    // Apply precision/rounding if specified
    let valueToFormat = this._value;
    if (precision) {
      valueToFormat = round(valueToFormat, precision, roundingStrategy);
    }

    const numericValue = valueToFormat.toNumber();

    // Use unified formatter (handles both standard and custom formatting)
    return MoneyFormatter.format(numericValue, options);
  }

  /**
   * Format to parts
   * Returns array of format parts
   */
  formatToParts(options: FormatOptions = {}): FormatPart[] {
    const { precision, roundingStrategy } = options;

    // Apply precision/rounding if specified
    let valueToFormat = this._value;
    if (precision) {
      valueToFormat = round(valueToFormat, precision, roundingStrategy);
    }

    const numericValue = valueToFormat.toNumber();
    return MoneyFormatter.formatToParts(numericValue, options);
  }

  /**
   * Convert to number
   */
  toNumber(): number {
    return this._value.toNumber();
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this._value.toString();
  }

  /**
   * Convert to JSON
   */
  toJSON(): string {
    return this._value.toString();
  }
}

