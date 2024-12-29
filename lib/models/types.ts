import { RoundStrategy } from "@enums";

export type MoneyFormatterOptions = {
  locale: string;
  templates?: Record<string, string>;
  overridedSymbols?: Record<string, string>;
  trailingZeroDisplay?: boolean | Record<string, boolean>;
  roundStrategy?: `${RoundStrategy}`;
  precision?: number;
  preventGrouping?: boolean;
};

export type TemplateMap = Record<string, TemplatePart[]>;

export type TemplatePart = CurrencyTemplatePart | CustomTemplatePart | IntegerTemplatePart | FractionTemplatePart;

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
  precision?: number;
};

export type MoneyFormat = {
  currency: string;
  value: number;
  integer: string;
  fraction: string;
  formatted: string;
  display: string;
};
