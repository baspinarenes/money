import { createMoney } from "../../lib/entities/initializer";
import { Money } from "../../lib/entities/money";
import { MoneyFormatterConfig } from "@types";

describe("createMoney tests", () => {
  test("should create Money instance with default config", () => {
    const createMoneyFn = createMoney({ locale: "TR" });
    const money = createMoneyFn(100);

    expect(money).toBeInstanceOf(Money);
    expect(money.value).toBe(100);
  });

  test("should create Money instance with custom config", () => {
    const config: MoneyFormatterConfig = {
      locale: "tr-TR",
      precision: { digit: 2 },
    };
    const createMoneyFn = createMoney(config);
    const money = createMoneyFn(100);

    expect(money).toBeInstanceOf(Money);
    expect(money.value).toBe(100);
  });

  test("should reuse same config for multiple instances", () => {
    const config: MoneyFormatterConfig = {
      locale: "fr-FR",
      precision: { digit: 3 },
    };
    const createMoneyFn = createMoney(config);

    const money1 = createMoneyFn(100);
    const money2 = createMoneyFn(200);

    expect(money1).toBeInstanceOf(Money);
    expect(money2).toBeInstanceOf(Money);
  });
});
