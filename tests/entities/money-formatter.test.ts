import { MoneyFormatter } from "@entities";
import { Money } from "../../lib/entities/money";
import { MoneyFormatterOptions } from "@types";
import { LOG_PREFIX } from "@constants";

describe("MoneyFormatter tests", () => {
  describe("Create method tests", () => {
    test("should create a MoneyFormatter instance with locale", () => {
      const formatter = MoneyFormatter.create({
        locale: "en-US",
      });

      expect(formatter).toBeInstanceOf(MoneyFormatter);
    });

    test("should create a MoneyFormatter instance with locale as country code", () => {
      const formatter = MoneyFormatter.create({
        locale: "US",
      });

      expect(formatter).toBeInstanceOf(MoneyFormatter);
    });

    test("should throw an error for invalid locale", () => {
      const locale = "invalid";
      expect(() => MoneyFormatter.create({ locale: "invalid" })).toThrowError(
        `${LOG_PREFIX} Invalid locale: ${locale}`
      );
    });

    test("should throw an error for empty locale", () => {
      const locale = "";
      expect(() => MoneyFormatter.create({ locale })).toThrowError(`${LOG_PREFIX} Invalid locale: ${locale}`);
    });
  });

  describe("Format method tests", () => {
    test("should format number", () => {
      const formatter = MoneyFormatter.create({ locale: "en-US" });

      expect(formatter.format(1234.56)).toBe("$1,234.56");
    });

    test("should format Money object", () => {
      const formatter = MoneyFormatter.create({ locale: "en-US" });
      const money = new Money(1234.56);

      expect(formatter.format(money)).toBe("$1,234.56");
    });

    test("should format Money object", () => {
      const formatter = MoneyFormatter.create({
        locale: "TR",
        templates: {
          "*": "Fiyat: {integer|.} {fraction|,|2} {currency} ",
        },
        overridedSymbols: {
          TR: "TL",
        },
      });
      const money = new Money(1234.56);

      expect(formatter.format(money)).toBe("Fiyat: 1.234 ,56 TL ");
    });

    test("should format Money object with overrided symbols", () => {
      const formatter = MoneyFormatter.create({
        locale: "tr-TR",
        templates: {
          TR: "{integer|.}{fraction|,|2} {currency}",
        },
        overridedSymbols: {
          TR: "TL",
        },
      });
      const money = new Money(1234.56);

      expect(formatter.format(money)).toBe("1.234,56 TL");
    });

    test("should format Money with overrided smybols for all locales", () => {
      const formatter = MoneyFormatter.create({
        locale: "tr-TR",
        templates: {
          "tr-TR": "{integer|.}{fraction|,|2} {currency}",
        },
        overridedSymbols: {
          "*": "$",
        },
      });
      const money = new Money(1234.56);

      expect(formatter.format(money)).toBe("1.234,56 $");
    });
  });

  describe("FormatToParts method tests", () => {
    test("should format to parts", () => {
      const formatter = MoneyFormatter.create({ locale: "en-US" });
      const parts = formatter.formatToParts(1234.56);

      expect(parts).toEqual({
        currency: "$",
        value: 1234.56,
        integer: "1,234",
        fraction: ".56",
        formatted: "1,234.56",
        display: "$1,234.56",
      });
    });

    test("should format to parts", () => {
      const formatter = MoneyFormatter.create({ locale: "en-US" });
      const parts = formatter.formatToParts(100);

      expect(parts).toEqual({
        currency: "$",
        value: 100,
        integer: "100",
        fraction: ".00",
        formatted: "100.00",
        display: "$100.00",
      });
    });

    test("should format to parts with trailingZeroDisplay", () => {
      const formatter = MoneyFormatter.create({
        locale: "en-US",
        trailingZeroDisplay: true,
      });
      const parts = formatter.formatToParts(100);

      expect(parts).toEqual({
        currency: "$",
        value: 100,
        integer: "100",
        fraction: "",
        formatted: "100",
        display: "$100",
      });
    });

    test("should format to parts with rounding", () => {
      const formatter = MoneyFormatter.create({
        locale: "en-US",
        roundStrategy: "down",
        precision: 1,
      });

      const parts = formatter.formatToParts(new Money(1234.567));

      expect(parts).toEqual({
        currency: "$",
        value: 1234.567,
        integer: "1,234",
        fraction: ".5",
        formatted: "1,234.5",
        display: "$1,234.5",
      });
    });

    test("should format to parts with custom template", () => {
      const customOptions: MoneyFormatterOptions = {
        locale: "tr-TR",
        templates: {
          "en-US": "{integer|,}{fraction|.|2} {currency}",
          "tr-TR": "{integer|.}{fraction|,|2} {currency}",
        },
      };
      const formatter = MoneyFormatter.create(customOptions);
      const parts = formatter.formatToParts(new Money(1234.56));
      expect(parts).toEqual({
        currency: "₺",
        value: 1234.56,
        integer: "1.234",
        fraction: ",56",
        formatted: "1.234,56",
        display: "1.234,56 ₺",
      });
    });

    test("should format to parts with currency override", () => {
      const overrideOptions: MoneyFormatterOptions = {
        locale: "tr-TR",
        overridedSymbols: {
          "tr-TR": "TL",
        },
      };
      const formatter = MoneyFormatter.create(overrideOptions);
      const parts = formatter.formatToParts(new Money(1234.56));
      expect(parts.currency).toBe("TL");
      expect(parts.display).toBe("TL1.234,56");
    });

    test("should format to parts without grouping when preventGrouping is false", () => {
      const overrideOptions: MoneyFormatterOptions = {
        locale: "tr-TR",
        overridedSymbols: {
          "tr-TR": "TL",
        },
        preventGrouping: true,
      };
      const formatter = MoneyFormatter.create(overrideOptions);
      const parts = formatter.formatToParts(new Money(1234.56));
      expect(parts.currency).toBe("TL");
      expect(parts.display).toBe("TL1234,56");
    });

    test("should format to parts with trailingZeroDisplay stripIfInteger", () => {
      const optionsWithTrailingZeroDisplay: MoneyFormatterOptions = {
        locale: "en-US",
        trailingZeroDisplay: true,
      };
      const formatter = MoneyFormatter.create(optionsWithTrailingZeroDisplay);
      expect(formatter.format(1234)).toBe("$1,234");
      expect(formatter.format(1234.5)).toBe("$1,234.5");
      expect(formatter.format(1234.5)).toBe("$1,234.5");
    });
  });

  describe("TrailingZeroDisplay method tests", () => {
    test("should handle trailingZeroDisplay as boolean", () => {
      const formatterTrue = MoneyFormatter.create({
        locale: "en-US",
        trailingZeroDisplay: true,
      });
      expect(formatterTrue.format(1234)).toBe("$1,234");
      const formatterFalse = MoneyFormatter.create({
        locale: "en-US",
        trailingZeroDisplay: false,
      });
      expect(formatterFalse.format(1234)).toBe("$1,234.00");
    });

    test("should handle trailingZeroDisplay as object", () => {
      const formatterLocale = MoneyFormatter.create({
        locale: "en-GB",
        trailingZeroDisplay: { "en-GB": true },
      });
      expect(formatterLocale.format(1234)).toBe("£1,234");

      const formatterCountryCode = MoneyFormatter.create({
        locale: "en-US",
        trailingZeroDisplay: { US: true },
      });
      expect(formatterCountryCode.format(1234)).toBe("$1,234");

      const formatterDefault = MoneyFormatter.create({
        locale: "en-US",
        trailingZeroDisplay: { "*": true },
      });
      expect(formatterDefault.format(1234)).toBe("$1,234");

      const formatterMixed = MoneyFormatter.create({
        locale: "en-US",
        trailingZeroDisplay: { "en-US": false, "*": true },
      });
      expect(formatterMixed.format(1234)).toBe("$1,234.00");
    });
  });

  describe("Format method tests", () => {
    test("should format number", () => {
      const formatter = MoneyFormatter.create({ locale: "en-US" });

      expect(formatter.format(1234.56)).toBe("$1,234.56");
    });

    test("should format Money object", () => {
      const formatter = MoneyFormatter.create({ locale: "en-US" });
      const money = new Money(1234.56);

      expect(formatter.format(money)).toBe("$1,234.56");
    });

    test("should format Money object", () => {
      const formatter = MoneyFormatter.create({
        locale: "TR",
        templates: {
          "*": "Fiyat: {integer|.} {fraction|,|2} {currency} ",
        },
        overridedSymbols: {
          TR: "TL",
        },
      });
      const money = new Money(1234.56);

      expect(formatter.format(money)).toBe("Fiyat: 1.234 ,56 TL ");
    });

    test("should format Money object with overrided symbols", () => {
      const formatter = MoneyFormatter.create({
        locale: "tr-TR",
        templates: {
          TR: "{integer|.}{fraction|,|2} {currency}",
        },
        overridedSymbols: {
          TR: "TL",
        },
      });
      const money = new Money(1234.56);

      expect(formatter.format(money)).toBe("1.234,56 TL");
    });

    test("should format Money with overrided smybols for all locales", () => {
      const formatter = MoneyFormatter.create({
        locale: "tr-TR",
        templates: {
          "tr-TR": "{integer|.}{fraction|,|2} {currency}",
        },
        overridedSymbols: {
          "*": "$",
        },
      });
      const money = new Money(1234.56);

      expect(formatter.format(money)).toBe("1.234,56 $");
    });
  });

  describe("FormatToParts method tests", () => {
    test("should format to parts", () => {
      const formatter = MoneyFormatter.create({ locale: "en-US" });
      const parts = formatter.formatToParts(1234.56);

      expect(parts).toEqual({
        currency: "$",
        value: 1234.56,
        integer: "1,234",
        fraction: ".56",
        formatted: "1,234.56",
        display: "$1,234.56",
      });
    });

    test("should format to parts", () => {
      const formatter = MoneyFormatter.create({ locale: "en-US" });
      const parts = formatter.formatToParts(100);

      expect(parts).toEqual({
        currency: "$",
        value: 100,
        integer: "100",
        fraction: ".00",
        formatted: "100.00",
        display: "$100.00",
      });
    });

    test("should format to parts with trailingZeroDisplay", () => {
      const formatter = MoneyFormatter.create({
        locale: "en-US",
        trailingZeroDisplay: true,
      });
      const parts = formatter.formatToParts(100);

      expect(parts).toEqual({
        currency: "$",
        value: 100,
        integer: "100",
        fraction: "",
        formatted: "100",
        display: "$100",
      });
    });

    test("should format to parts with rounding", () => {
      const formatter = MoneyFormatter.create({
        locale: "en-US",
        roundStrategy: "down",
        precision: 1,
      });

      const parts = formatter.formatToParts(new Money(1234.567));

      expect(parts).toEqual({
        currency: "$",
        value: 1234.567,
        integer: "1,234",
        fraction: ".5",
        formatted: "1,234.5",
        display: "$1,234.5",
      });
    });

    test("should format to parts with custom template", () => {
      const customOptions: MoneyFormatterOptions = {
        locale: "tr-TR",
        templates: {
          "en-US": "{integer|,}{fraction|.|2} {currency}",
          "tr-TR": "{integer|.}{fraction|,|2} {currency}",
        },
      };
      const formatter = MoneyFormatter.create(customOptions);
      const parts = formatter.formatToParts(new Money(1234.56));
      expect(parts).toEqual({
        currency: "₺",
        value: 1234.56,
        integer: "1.234",
        fraction: ",56",
        formatted: "1.234,56",
        display: "1.234,56 ₺",
      });
    });

    test("should format to parts with currency override", () => {
      const overrideOptions: MoneyFormatterOptions = {
        locale: "tr-TR",
        overridedSymbols: {
          "tr-TR": "TL",
        },
      };
      const formatter = MoneyFormatter.create(overrideOptions);
      const parts = formatter.formatToParts(new Money(1234.56));
      expect(parts.currency).toBe("TL");
      expect(parts.display).toBe("TL1.234,56");
    });

    test("should format to parts without grouping when preventGrouping is false", () => {
      const overrideOptions: MoneyFormatterOptions = {
        locale: "tr-TR",
        overridedSymbols: {
          "tr-TR": "TL",
        },
        preventGrouping: true,
      };
      const formatter = MoneyFormatter.create(overrideOptions);
      const parts = formatter.formatToParts(new Money(1234.56));
      expect(parts.currency).toBe("TL");
      expect(parts.display).toBe("TL1234,56");
    });

    test("should format to parts with trailingZeroDisplay stripIfInteger", () => {
      const optionsWithTrailingZeroDisplay: MoneyFormatterOptions = {
        locale: "en-US",
        trailingZeroDisplay: true,
      };
      const formatter = MoneyFormatter.create(optionsWithTrailingZeroDisplay);
      expect(formatter.format(1234)).toBe("$1,234");
      expect(formatter.format(1234.5)).toBe("$1,234.5");
      expect(formatter.format(1234.5)).toBe("$1,234.5");
    });
  });
});
