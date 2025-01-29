import { RoundStrategy } from "@enums";

export type MoneyFormatterConfig = {
  locale: string;
  templates?: Record<string, string>;
  overridedSymbols?: Record<string, string>;
  trimDoubleZeros?: boolean | Record<string, boolean>;
  trimPaddingZeros?: boolean | Record<string, boolean>;
  precision?: {
    digit: number;
    strategy?: `${RoundStrategy}`;
  };
  preventGrouping?: boolean;
};

export type TemplateMap = Record<string, TemplatePart[]>;

export type TemplatePart =
  | CurrencyTemplatePart
  | CustomTemplatePart
  | IntegerTemplatePart
  | FractionTemplatePart;

export type CurrencyTemplatePart = {
  type: "currency";
};

export type CustomTemplatePart = {
  type: "custom";
  value: string;
};

export type IntegerTemplatePart = {
  type: "integer";
  delimiter: string;
};

export type FractionTemplatePart = {
  type: "fraction";
  delimiter: string;
};

export type MoneyFormat = {
  currency: string;
  value: number;
  integer: string;
  fraction: string;
  formatted: string;
  display: string;
};
