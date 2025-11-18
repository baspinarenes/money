import Decimal from "decimal.js-light";
import { MoneyInput, RoundStrategy } from "../types";

function isMoneyInstance(
  value: unknown
): value is { value: number; amount: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "amount" in value &&
    typeof (value as { value: unknown }).value === "number"
  );
}

export function toBig(value: MoneyInput | Decimal): Decimal {
  if (value instanceof Decimal) return value;
  if (isMoneyInstance(value)) return new Decimal(value.value);
  return new Decimal(value as number | string);
}

export function round(
  value: Decimal,
  precision: number,
  strategy: RoundStrategy = RoundStrategy.NEAREST
): Decimal {
  switch (strategy) {
    case RoundStrategy.UP:
      return value.toDecimalPlaces(precision, Decimal.ROUND_UP);
    case RoundStrategy.DOWN:
      return value.toDecimalPlaces(precision, Decimal.ROUND_DOWN);
    case RoundStrategy.NEAREST:
    default:
      return value.toDecimalPlaces(precision, Decimal.ROUND_HALF_UP);
  }
}

export function add(a: Decimal, b: Decimal): Decimal {
  return a.plus(b);
}

export function subtract(a: Decimal, b: Decimal): Decimal {
  return a.minus(b);
}

export function multiply(a: Decimal, b: Decimal): Decimal {
  return a.times(b);
}

export function divide(a: Decimal, b: Decimal): Decimal {
  if (b.isZero()) throw new Error("Division by zero is not allowed");
  return a.dividedBy(b);
}

export function calculateDiscount(
  amount: Decimal,
  percentage: number | string
): Decimal {
  const discountRate = toBig(percentage).dividedBy(100);
  const discountAmount = multiply(amount, discountRate);
  return subtract(amount, discountAmount);
}

export function compare(a: Decimal, b: Decimal): number {
  return a.comparedTo(b);
}
