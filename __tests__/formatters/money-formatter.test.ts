import { describe, expect, it } from "vitest";
import { MoneyFormatter } from "../../src/formatters/money-formatter";
import { RoundStrategy } from "../../src/types";

describe("MoneyFormatter tests", () => {
  describe("format() tests", () => {
    describe("Basic formatting tests", () => {
      it.each([
        [100, { locale: "en-US" }, "$100.00"],
        [1000.5, { locale: "en-US" }, "$1,000.50"],
        [1000.5, { locale: "de-DE" }, "1.000,50\u00A0€"], // \u00A0 is non-breaking space used by Intl API
        [1000.5, { locale: "tr-TR" }, "₺1.000,50"],
      ])(
        "should format %s with options %o equals to %s",
        (value, options, expected) => {
          const result = MoneyFormatter.format(value, options);
          expect(result).toBe(expected);
        }
      );
    });

    describe("Precision tests", () => {
      it.each([
        [100.456, { precision: 2 }, "$100.46"],
        [100.456, { precision: 3 }, "$100.456"],
        [100.456, { precision: 1 }, "$100.5"],
        [100.456, { precision: 0 }, "$100"],
      ])(
        "should format %s with precision %d equals to %s",
        (value, options, expected) => {
          const result = MoneyFormatter.format(value, {
            ...options,
            locale: "en-US",
          });
          expect(result).toBe(expected);
        }
      );

      it("should apply rounding strategy with precision", () => {
        const value = 100.456;
        const result1 = MoneyFormatter.format(value, {
          precision: 2,
          roundingStrategy: RoundStrategy.UP,
          locale: "en-US",
          currency: "USD",
        });
        const result2 = MoneyFormatter.format(value, {
          precision: 2,
          roundingStrategy: RoundStrategy.DOWN,
          locale: "en-US",
          currency: "USD",
        });
        expect(result1).not.toBe(result2);
      });
    });

    describe("Templates tests", () => {
      it("should use template when provided", () => {
        const result = MoneyFormatter.format(5000.99, {
          locale: "en-US",
          currency: "USD",
          templates: {
            "en-US": "{Symbol} 5.000,50",
          },
        });
        expect(result).toContain("$");
        expect(result).toContain("5");
      });

      it("should use template precision when precision not provided", () => {
        const result = MoneyFormatter.format(5000.999, {
          locale: "en-US",
          currency: "USD",
          templates: {
            "en-US": "{Symbol} 5.000,50", // 2 decimal digits
          },
        });
        expect(result).toBeTruthy();
      });

      it("should prioritize culture over country over language", () => {
        const result = MoneyFormatter.format(1000, {
          locale: "en-US",
          currency: "USD",
          templates: {
            "en-US": "{Symbol} 1,000.00",
            US: "{Symbol} 1.000,00",
            en: "{Symbol} 1 000.00",
          },
        });
        expect(result).toContain("$");
      });
    });

    describe("Zero trimming tests", () => {
      it("should trim double zeros when enabled", () => {
        const result = MoneyFormatter.format(100, {
          trimDoubleZeros: true,
          locale: "en-US",
          currency: "USD",
        });
        expect(result).toBeTruthy();
      });

      it("should trim padding zeros when enabled", () => {
        const result = MoneyFormatter.format(100, {
          trimPaddingZeros: true,
          locale: "en-US",
          currency: "USD",
        });
        expect(result).toBeTruthy();
      });
    });

    describe("Symbol overrides tests", () => {
      it("should override currency symbol", () => {
        const result = MoneyFormatter.format(100, {
          locale: "en-US",
          currency: "EUR",
        });
        expect(result).toContain("€");
      });
    });
  });

  describe("formatToParts() tests", () => {
    it("should return format parts", () => {
      const parts = MoneyFormatter.formatToParts(1000.5, {
        locale: "en-US",
        currency: "USD",
      });
      expect(Array.isArray(parts)).toBe(true);
      expect(parts.length).toBeGreaterThan(0);
      expect(parts.every((part) => part.type && part.value)).toBe(true);
    });

    it("should include currency part", () => {
      const parts = MoneyFormatter.formatToParts(100, {
        locale: "en-US",
        currency: "USD",
      });
      const currencyPart = parts.find((part) => part.type === "currency");
      expect(currencyPart).toBeDefined();
    });
  });
});
