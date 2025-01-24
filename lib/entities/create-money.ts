import { MoneyFormatterOptions } from "@types";
import { ConfigStore } from "../config/config-store";
import { Money } from "./money";

export function createMoney(config?: MoneyFormatterOptions) {
    if (config) {
      ConfigStore.getInstance().setConfig(config);
    }
  
    return (amount: number) => new Money(amount);
}