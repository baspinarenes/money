export enum RoundStrategy {
  NEAREST,
  UP,
  DOWN,
}

export enum ComparisonResult {
  LESS_THAN = -1,
  EQUAL = 0,
  GREATER_THAN = 1,
}

export interface FormatPart {
  type: string;
  value: string;
}

export interface FormatOptions {
  locale?: string;
  currency?: string;
  templates?: Record<string, string>;
  trimDoubleZeros?: boolean | Record<string, boolean>;
  trimPaddingZeros?: boolean | Record<string, boolean>;
  precision?: number;
  roundingStrategy?: RoundStrategy;
  preventGrouping?: boolean;
}

export interface ParseOptions {
  locale?: string;
  currency?: string;
  template?: string;
}

export type MoneyInput = number | string | Money;

export declare class Money {
  readonly value: string;
  readonly amount: number;

  constructor(value: MoneyInput);

  add(other: MoneyInput): Money;
  subtract(other: MoneyInput): Money;
  multiply(factor: number | string): Money;
  divide(divisor: number | string): Money;
  round(precision?: number, roundingStrategy?: RoundStrategy): Money;
  discount(percentage: number | string): Money;
  equal(other: MoneyInput): boolean;
  compare(other: MoneyInput): ComparisonResult;
  isZero(): boolean;
  isPositive(): boolean;
  isNegative(): boolean;
  abs(): Money;
  negate(): Money;
  format(options?: FormatOptions): string;
  formatToParts(options?: FormatOptions): FormatPart[];
  toNumber(): number;
  toString(): string;
  toJSON(): string;

  static parse(value: string, options?: ParseOptions): Money;
}

