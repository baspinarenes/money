import { ConfigStore } from "../../lib/config/config-store";
import { MoneyFormatterOptions } from "@types";

describe("ConfigStore tests", () => {
  beforeEach(() => {
    (ConfigStore as any).instance = undefined;
  });

  describe("Singleton pattern tests", () => {
    test("should create only one instance", () => {
      const instance1 = ConfigStore.getInstance();
      const instance2 = ConfigStore.getInstance();

      expect(instance1).toBe(instance2);
    });

    test("should initialize with default config", () => {
      const instance = ConfigStore.getInstance();
      const config = instance.getConfig();

      expect(config).toEqual({
        locale: "en-US"
      });
    });
  });

  describe("Configuration management tests", () => {
    test("should set and get new config", () => {
      const instance = ConfigStore.getInstance();
      const newConfig: MoneyFormatterOptions = {
        locale: "tr-TR"
      };

      instance.setConfig(newConfig);
      expect(instance.getConfig()).toEqual(newConfig);
    });

    test("should merge new config with existing config", () => {
      const instance = ConfigStore.getInstance();
      const initialConfig: MoneyFormatterOptions = {
        locale: "fr-FR",
        precision: 2
      };
      const updatedConfig: MoneyFormatterOptions = {
        locale: "de-DE"
      };

      instance.setConfig(initialConfig);
      instance.setConfig(updatedConfig);

      expect(instance.getConfig()).toEqual({
        locale: "de-DE",
        precision: 2
      });
    });

    test("should maintain config across multiple getInstance calls", () => {
      const instance1 = ConfigStore.getInstance();
      const newConfig: MoneyFormatterOptions = {
        locale: "es-ES"
      };

      instance1.setConfig(newConfig);
      
      const instance2 = ConfigStore.getInstance();
      expect(instance2.getConfig()).toEqual(newConfig);
    });
  });
});
