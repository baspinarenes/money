import { createMoney } from "../../lib/entities/create-money";
import { ConfigStore } from "../../lib/config/config-store";
import { Money } from "../../lib/entities/money";
import { MoneyFormatterOptions } from "@types";

describe("createMoney tests", () => {
  beforeEach(() => {
    (ConfigStore as any).instance = undefined;
  });

  test("should create Money instance with default config", () => {
    const createMoneyFn = createMoney();
    const money = createMoneyFn(100);

    expect(money).toBeInstanceOf(Money);
    expect(money.value).toBe(100);
    expect(ConfigStore.getInstance().getConfig()).toEqual({
      locale: "en-US"
    });
  });

  test("should create Money instance with custom config", () => {
    const config: MoneyFormatterOptions = {
      locale: "tr-TR",
      precision: 2
    };
    const createMoneyFn = createMoney(config);
    const money = createMoneyFn(100);

    expect(money).toBeInstanceOf(Money);
    expect(money.value).toBe(100);
    expect(ConfigStore.getInstance().getConfig()).toEqual(config);
  });

  test("should reuse same config for multiple instances", () => {
    const config: MoneyFormatterOptions = {
      locale: "fr-FR",
      precision: 3
    };
    const createMoneyFn = createMoney(config);
    
    const money1 = createMoneyFn(100);
    const money2 = createMoneyFn(200);

    expect(money1).toBeInstanceOf(Money);
    expect(money2).toBeInstanceOf(Money);
    expect(ConfigStore.getInstance().getConfig()).toEqual(config);
  });
});
