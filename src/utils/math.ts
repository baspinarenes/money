import Big from "big.js";
import { MoneyInput, RoundStrategy } from "../types";

function isMoneyInstance(
  value: unknown
): value is { value: string; amount: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "amount" in value &&
    typeof (value as { value: unknown }).value === "string"
  );
}

export function toBig(value: MoneyInput | Big): Big {
  if (value instanceof Big) return value;
  if (isMoneyInstance(value)) return new Big(value.value);
  return new Big(value as number | string);
}

export function round(
  value: Big,
  precision: number,
  strategy: RoundStrategy = RoundStrategy.NEAREST
): Big {
  const multiplier = new Big(10).pow(precision);
  const multiplied = value.times(multiplier);

  switch (strategy) {
    case RoundStrategy.UP: {
      const rounded = multiplied.round(0, Big.roundUp);
      return rounded.div(multiplier);
    }
    case RoundStrategy.DOWN: {
      const rounded = multiplied.round(0, Big.roundDown);
      return rounded.div(multiplier);
    }
    case RoundStrategy.NEAREST:
    default:
      return value.round(precision, Big.roundHalfUp);
  }
}

export function add(a: Big, b: Big): Big {
  return a.plus(b);
}

export function subtract(a: Big, b: Big): Big {
  return a.minus(b);
}

export function multiply(a: Big, b: Big): Big {
  return a.times(b);
}

export function divide(a: Big, b: Big): Big {
  if (b.eq(0)) throw new Error("Division by zero is not allowed");
  return a.div(b);
}

export function calculateDiscount(
  amount: Big,
  percentage: number | string
): Big {
  const discountRate = toBig(percentage).div(100);
  const discountAmount = multiply(amount, discountRate);
  return subtract(amount, discountAmount);
}

export function compare(a: Big, b: Big): number {
  if (a.lt(b)) return -1;
  if (a.gt(b)) return 1;
  return 0;
}
