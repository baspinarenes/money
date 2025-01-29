import { LOG_PREFIX } from "@constants";
import { RoundStrategy } from "@enums";
import { MoneyFormat, MoneyFormatterConfig } from "@types";
import { ceil, divide, equal, floor, minus, multiply, plus, pow, round } from "@utils";
import { MoneyFormatter } from "./money-formatter";

export class Money {
  private readonly _amount: number;
  private readonly _config: MoneyFormatterConfig;

  constructor(amount: number, config?: MoneyFormatterConfig) {
    this._amount = Number.isFinite(amount) ? amount : 0;
    this._config = config || ({} as MoneyFormatterConfig);
  }

  get amount(): number {
    return this._amount;
  }

  get value(): number {
    return this._amount;
  }

  get integer(): number {
    return floor(this.value, 0).toNumber();
  }

  get fraction(): number {
    const { value } = this.handleFraction();
    return value.toNumber();
  }

  get formattedFraction(): string {
    const { formatted } = this.handleFraction();
    return formatted;
  }

  protected handleFraction() {
    const fractionPart = minus(this.value, this.integer);
    const fractionString = fractionPart.toFixed();
    const decimalPart = fractionString.substring(fractionString.indexOf(".") + 1);
    const precision = decimalPart.length;

    return {
      value: multiply(fractionPart.toNumber(), pow(10, precision).toNumber()),
      formatted: decimalPart,
    };
  }

  protected getValue(money: number | Money): number {
    return money instanceof Money ? money.value : money;
  }

  add(amount: number | Money): Money {
    return new Money(plus(this.value, this.getValue(amount)).toNumber(), this._config);
  }

  subtract(amount: number | Money): Money {
    return new Money(minus(this.value, this.getValue(amount)).toNumber(), this._config);
  }

  multiply(amount: number | Money): Money {
    return new Money(multiply(this.value, this.getValue(amount)).toNumber(), this._config);
  }

  divide(amount: number | Money): Money {
    if (this.getValue(amount) === 0) {
      throw new Error(`${LOG_PREFIX} Cannot divide by zero.`);
    }

    return new Money(divide(this.value, this.getValue(amount)).toNumber(), this._config);
  }

  round(decimals: number, strategy?: `${RoundStrategy}`): Money {
    let roundedValue: number;

    switch (strategy) {
      case RoundStrategy.UP:
        roundedValue = ceil(this.value, decimals).toNumber();
        break;
      case RoundStrategy.DOWN:
        roundedValue = floor(this.value, decimals).toNumber();
        break;
      case RoundStrategy.NEAREST:
      default:
        roundedValue = round(this.value, decimals).toNumber();
        break;
    }

    return new Money(roundedValue, this._config);
  }

  discount(rate: number): Money {
    if (rate < 0 || rate > 100) {
      throw new Error(`${LOG_PREFIX} Discount rate must be between 0-1 or 0-100.`);
    }

    return this.multiply(1 - (rate > 1 ? rate / 100 : rate));
  }

  equal(amount: number | Money): boolean {
    return equal(this.value, this.getValue(amount));
  }

  format(config: Partial<MoneyFormatterConfig> = {}): string {
    return MoneyFormatter.create({ ...this._config, ...config }).format(this);
  }

  formatToParts(config: Partial<MoneyFormatterConfig> = {}): MoneyFormat {
    return MoneyFormatter.create({ ...this._config, ...config }).formatToParts(this);
  }

  valueOf(): number {
    return this.amount;
  }

  toString(): string {
    return String(this.amount);
  }
}
