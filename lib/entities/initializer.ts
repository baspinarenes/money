import { MoneyFormatterConfig } from "@types";
import { Money } from "@entities";

export const money = (amount: number) => new Money(amount);

export const monetizer = (config: MoneyFormatterConfig) => {
  return (amount: number) => new Money(amount, config);
};

export const createMoney = monetizer;