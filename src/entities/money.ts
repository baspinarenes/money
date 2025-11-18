import Decimal from 'decimal.js-light';
import { MoneyFormatter } from '../formatters/money-formatter';
import {
  ComparisonResult,
  FormatComponents,
  FormatOptions,
  FormatPart,
  MoneyInput,
  RoundStrategy,
} from '../types';


export class Money {
  private readonly _value: Decimal;

  constructor(value: MoneyInput) {
    if (value instanceof Money) {
      this._value = value._value;
    } else {
      try {
        this._value = this.toDecimal(value);
      } catch (error) {
        throw new Error(`Invalid money value: ${value}. ${error instanceof Error ? error.message : ''}`);
      }
    }
  }

  get value(): number {
    return this._value.toNumber();
  }

  get amount(): number {
    return this.value;
  }

  private toDecimal(value: MoneyInput): Decimal {
    if (value instanceof Money) return value._value;
    return new Decimal(value);
  }

  add(other: MoneyInput): Money {
    const result = this._value.plus(this.toDecimal(other));
    return new Money(result.toString());
  }

  subtract(other: MoneyInput): Money {
    const result = this._value.minus(this.toDecimal(other));
    return new Money(result.toString());
  }

  multiply(factor: number | string): Money {
    const factorDecimal = new Decimal(factor);
    const result = this._value.times(factorDecimal);
    return new Money(result.toString());
  }

  divide(divisor: number | string): Money {
    const divisorDecimal = new Decimal(divisor);
    if (divisorDecimal.isZero()) {
      throw new Error('Division by zero is not allowed');
    }
    const result = this._value.dividedBy(divisorDecimal);
    return new Money(result.toString());
  }

  round(precision?: number, roundingStrategy?: RoundStrategy): Money {
    if (!precision) {
      precision = 2;
      roundingStrategy = RoundStrategy.UP;
    }

    let roundingMode: number;
    switch (roundingStrategy) {
      case RoundStrategy.UP:
        roundingMode = Decimal.ROUND_UP;
        break;
      case RoundStrategy.DOWN:
        roundingMode = Decimal.ROUND_DOWN;
        break;
      case RoundStrategy.NEAREST:
      default:
        roundingMode = Decimal.ROUND_HALF_UP;
        break;
    }

    const rounded = this._value.toDecimalPlaces(precision, roundingMode);
    return new Money(rounded.toString());
  }

  discount(percentage: number | string): Money {
    const discountRate = new Decimal(percentage).dividedBy(100);
    const discountAmount = this._value.times(discountRate);
    const result = this._value.minus(discountAmount);
    return new Money(result.toString());
  }

  equal(other: MoneyInput): boolean {
    return this._value.equals(this.toDecimal(other));
  }

  compare(other: MoneyInput): ComparisonResult {
    return this._value.comparedTo(this.toDecimal(other)) as ComparisonResult;
  }

  isZero(): boolean {
    return this._value.isZero();
  }

  isPositive(): boolean {
    return this._value.greaterThan(0);
  }

  isNegative(): boolean {
    return this._value.lessThan(0);
  }

  abs(): Money {
    return new Money(this._value.abs().toNumber());
  }

  format(options: FormatOptions = {}): string {
    const components = this.formatToComponents(options);
    return components.formattedWithSymbol;
  }

  formatToParts(options: FormatOptions = {}): FormatPart[] {
    return MoneyFormatter.formatToParts(this._value.toNumber(), options);
  }

  formatToComponents(options: FormatOptions = {}): FormatComponents {
    const parts = this.formatToParts(options);
    
    let currency = '';
    let groupDelimiter = '';
    let decimalDelimiter = '.';
    const formattedParts: string[] = [];
    const allParts: string[] = [];
    
    for (const part of parts) {
      allParts.push(part.value);
      
      if (part.type === 'currency') {
        currency = part.value;
      } else {
        formattedParts.push(part.value);
        
        if (part.type === 'group') {
          groupDelimiter = part.value;
        } else if (part.type === 'decimal') {
          decimalDelimiter = part.value;
        }
      }
    }
    
    return {
      currency,
      groupDelimiter,
      decimalDelimiter,
      formatted: formattedParts.join(''),
      formattedWithSymbol: allParts.join(''),
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

