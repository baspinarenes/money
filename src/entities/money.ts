import Big from 'big.js';
import { MoneyFormatter } from '../formatters/money-formatter';
import {
  ComparisonResult,
  FormatComponents,
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


export class Money {
  private readonly _value: Big;

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

  get value(): string {
    return this._value.toString();
  }

  get amount(): number {
    return this._value.toNumber();
  }

  add(other: MoneyInput): Money {
    const otherBig = other instanceof Money ? other._value : toBig(other);
    const result = addBig(this._value, otherBig);
    return new Money(result.toString());
  }

  subtract(other: MoneyInput): Money {
    const otherBig = other instanceof Money ? other._value : toBig(other);
    const result = subtractBig(this._value, otherBig);
    return new Money(result.toString());
  }

  multiply(factor: number | string): Money {
    const factorBig = toBig(factor);
    const result = multiplyBig(this._value, factorBig);
    return new Money(result.toString());
  }

  divide(divisor: number | string): Money {
    const divisorBig = toBig(divisor);
    const result = divideBig(this._value, divisorBig);
    return new Money(result.toString());
  }

  round(precision?: number, roundingStrategy?: RoundStrategy): Money {
    if (!precision) {
      // Default: round to 2 decimal places using banker's rounding
      precision = 2;
      roundingStrategy = RoundStrategy.UP;
    }

    const rounded = round(this._value, precision, roundingStrategy);
    return new Money(rounded.toString());
  }

  discount(percentage: number | string): Money {
    const result = calculateDiscount(this._value, percentage);
    return new Money(result.toString());
  }

  equal(other: MoneyInput): boolean {
    const otherBig = other instanceof Money ? other._value : toBig(other);
    return this._value.eq(otherBig);
  }

  compare(other: MoneyInput): ComparisonResult {
    const otherBig = other instanceof Money ? other._value : toBig(other);
    const result = compareBig(this._value, otherBig);
    return result as ComparisonResult;
  }

  isZero(): boolean {
    return this._value.eq(0);
  }

  isPositive(): boolean {
    return this._value.gt(0);
  }

  isNegative(): boolean {
    return this._value.lt(0);
  }

  abs(): Money {
    return new Money(this._value.abs().toString());
  }

  negate(): Money {
    return new Money(this._value.times(-1).toString());
  }

  format(options: FormatOptions = {}): string {
    const components = this.formatToComponents(options);
    return components.formattedWithSymbol;
  }

  formatToParts(options: FormatOptions = {}): FormatPart[] {
    const { precision, roundingStrategy } = options;

    let valueToFormat = this._value;
    if (precision) {
      valueToFormat = round(valueToFormat, precision, roundingStrategy);
    }

    const numericValue = valueToFormat.toNumber();
    return MoneyFormatter.formatToParts(numericValue, options);
  }

  formatToComponents(options: FormatOptions = {}): FormatComponents {
    const parts = this.formatToParts(options);
    
    const currencyPart = parts.find((part) => part.type === 'currency');
    const currency = currencyPart?.value || '';
    
    const groupPart = parts.find((part) => part.type === 'group');
    const groupDelimiter = groupPart?.value || '';
    
    const decimalPart = parts.find((part) => part.type === 'decimal');
    const decimalDelimiter = decimalPart?.value || '.';
    
    const formatted = parts
      .filter((part) => part.type !== 'currency')
      .map((part) => part.value)
      .join('');
    
    const formattedWithSymbol = parts.map((part) => part.value).join('');
    
    return {
      currency,
      groupDelimiter,
      decimalDelimiter,
      formatted,
      formattedWithSymbol,
    };
  }

  toNumber(): number {
    return this._value.toNumber();
  }

  toString(): string {
    return this._value.toString();
  }

  toJSON(): string {
    return this._value.toString();
  }
}

