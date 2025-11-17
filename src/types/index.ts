import { Money } from "../entities/money";

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
