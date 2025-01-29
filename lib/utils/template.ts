import { TemplatePart } from "@types";

export const isValidLocale = (locale: string): boolean => {
  return /^(?:[a-z]{2}-)?[A-Z]{2}$/.test(locale);
};

export const templateHandlers: Record<string, (rest: string[]) => TemplatePart> = {
  integer: ([delimiter = "."]) => ({
    type: "integer",
    delimiter,
  }),
  fraction: ([delimiter = ","]) => ({
    type: "fraction",
    delimiter,
  }),
  currency: () => ({ type: "currency" }),
};

export const intlPartHandlers: Record<string, (value: string) => TemplatePart> = {
  group: (value: string) => ({ type: "integer", delimiter: value }),
  decimal: (value: string) => ({ type: "fraction", delimiter: value }),
  currency: () => ({ type: "currency" }),
};

export const formatWithGrouping = (x: number, delimiter: string) => {
  const integerParts = String(x).match(/\d{1,3}(?=(\d{3})*$)|\d{1,3}$/g)!;
  return integerParts.join(delimiter);
};
