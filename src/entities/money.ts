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

  get value(): number {
    return this._value.toNumber();
  }

  get amount(): number {
    return this.value;
  }

  private convertToBig(other: MoneyInput): Big {
    return other instanceof Money ? other._value : toBig(other);
  }

  add(other: MoneyInput): Money {
    const result = addBig(this._value, this.convertToBig(other));
    return new Money(result.toString());
  }

  subtract(other: MoneyInput): Money {
    const result = subtractBig(this._value, this.convertToBig(other));
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
    return this._value.eq(this.convertToBig(other));
  }

  compare(other: MoneyInput): ComparisonResult {
    return compareBig(this._value, this.convertToBig(other)) as ComparisonResult;
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

