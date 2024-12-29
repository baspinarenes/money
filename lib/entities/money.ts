import { LOG_PREFIX } from "@constants";
import { RoundStrategy } from "@enums";
import { MoneyFormat, MoneyFormatterOptions } from "@types";
import { ceil, divide, equal, floor, minus, multiply, plus, pow, round } from "@utils";
import { MoneyFormatter } from "./money-formatter";

export class Money {
  _amount: number;

  constructor(amount: number) {
    if (!Number.isFinite(amount)) {
      this._amount = 0;
    } else {
      this._amount = amount;
    }
  }

  get amount(): number {
    return this._amount;
  }

  get value(): number {
    return this.amount;
  }

  get integer(): number {
    return floor(this.amount, 0);
  }

  get fraction(): number {
    const { value } = this.handleFraction();
    return value;
  }

  get formattedFraction(): string {
    const { formatted } = this.handleFraction();
    return formatted;
  }

  private handleFraction() {
    const fractionPart = minus(this.amount, this.integer);
    const fractionString = fractionPart.toString();
    const decimalPart = fractionString.substring(fractionString.indexOf(".") + 1);
    const precision = decimalPart.length;

    return {
      value: multiply(fractionPart, pow(10, precision)),
      formatted: decimalPart,
    };
  }

  add(amount: number | Money): Money {
    return new Money(plus(this.amount, this.getValue(amount)));
  }

  subtract(amount: number | Money): Money {
    return new Money(minus(this.amount, this.getValue(amount)));
  }

  multiply(amount: number | Money): Money {
    return new Money(multiply(this.amount, this.getValue(amount)));
  }

  divide(amount: number | Money): Money {
    if (this.getValue(amount) === 0) {
      throw new Error(`${LOG_PREFIX} Cannot divide by zero.`);
    }

    return new Money(divide(this.amount, this.getValue(amount)));
  }

  round(decimals: number, strategy?: `${RoundStrategy}`): Money {
    let roundedValue: number;

    switch (strategy) {
      case RoundStrategy.UP:
        roundedValue = ceil(this.amount, decimals);
        break;
      case RoundStrategy.DOWN:
        roundedValue = floor(this.amount, decimals);
        break;
      case RoundStrategy.NEAREST:
      default:
        roundedValue = round(this.amount, decimals);
        break;
    }

    return new Money(roundedValue);
  }

  discount(rate: number): Money {
    if (rate < 0 || rate > 100) {
      throw new Error(`${LOG_PREFIX} Discount rate must be between 0-1 or 0-100.`);
    }

    return this.multiply(1 - (rate > 1 ? rate / 100 : rate));
  }

  equal(amount: number | Money): boolean {
    return equal(this.amount, this.getValue(amount));
  }

  format(options: MoneyFormatterOptions): string {
    return MoneyFormatter.create(options).format(this);
  }

  formatToParts(options: MoneyFormatterOptions): MoneyFormat {
    return MoneyFormatter.create(options).formatToParts(this);
  }

  valueOf(): number {
    return this.amount;
  }

  toString(): string {
    return String(this.amount);
  }

  // Helpers

  private getValue(money: number | Money): number {
    return money instanceof Money ? money.amount : money;
  }
}

export function monetize(amount: number) {
  return new Money(amount);
}
