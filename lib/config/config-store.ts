import { MoneyFormatterOptions } from "@types";

export class ConfigStore {
  private static instance: ConfigStore;
  private config: MoneyFormatterOptions;

  private constructor() {
    this.config = {
      locale: "en-US",
      templates: {
        "*": "{integer|,}{fraction|.|2} {currency}",
      },
      trailingZeroDisplay: false,
    };
  }

  static getInstance(): ConfigStore {
    if (!ConfigStore.instance) {
      ConfigStore.instance = new ConfigStore();
    }
    return ConfigStore.instance;
  }

  setConfig(config: MoneyFormatterOptions) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): MoneyFormatterOptions {
    return this.config;
  }
}
