import { LOG_PREFIX, TEMPLATE_OPTIONS_DELIMETER, TEMPLATE_PARSER_REGEX } from "@constants";
import type { MoneyFormatterConfig, MoneyFormat, TemplateMap, TemplatePart } from "@types";
import { formatWithGrouping, intlPartHandlers, isValidLocale, templateHandlers } from "@utils";
import { Money } from "./money";
import countryToCurrency, { Countries } from "country-to-currency";
import { RoundStrategy } from "@enums";

export class MoneyFormatter {
  private readonly config: {
    locale: string;
    templates: Record<string, string>;
    overridedSymbols: Record<string, string>;
    trimDoubleZeros: boolean | Record<string, boolean>;
    trimPaddingZeros: boolean | Record<string, boolean>;
    preventGrouping: boolean;
    precision?: {
      digit: number;
      strategy?: `${RoundStrategy}`;
    };
  };
  private readonly parsedTemplates: TemplateMap;

  constructor(config: MoneyFormatterConfig) {
    const { locale } = config || {};

    if (!locale || !isValidLocale(locale)) {
      throw new Error(`${LOG_PREFIX} Invalid locale: ${locale}`);
    }

    this.config = {
      locale,
      overridedSymbols: config?.overridedSymbols || {},
      trimDoubleZeros: config?.trimDoubleZeros || false,
      trimPaddingZeros: config?.trimPaddingZeros || false,
      templates: config?.templates || {},
      precision: config?.precision,
      preventGrouping: config?.preventGrouping || false,
    };

    this.parsedTemplates = this.parseTemplates(config?.templates);
  }

  static create(config: MoneyFormatterConfig) {
    return new MoneyFormatter(config);
  }

  formatToParts(_money: number | Money): MoneyFormat {
    let money = _money instanceof Money ? _money : new Money(_money, this.config);

    const fractionPart = this.getTemplate().find((p) => p.type === "fraction")!;
    const integerPart = this.getTemplate().find((p) => p.type === "integer")!;

    let manipulatedMoney = money;

    if (this.config.precision) {
      manipulatedMoney = money.round(
        this.config.precision.digit,
        this.config.precision?.strategy ?? RoundStrategy.DOWN
      );
    }

    const formattedInteger = this.config.preventGrouping
      ? String(manipulatedMoney.integer)
      : formatWithGrouping(manipulatedMoney.integer, integerPart.delimiter);

    let formattedFraction = manipulatedMoney.fraction
      ? `${fractionPart.delimiter}${manipulatedMoney.formattedFraction}`
      : "";

    const hasFraction = !!formattedFraction;
    const allowDoubleZeros = !this.trimDoubleZeros;
    const allowPaddingZeros = !this.trimPaddingZeros;

    if (!hasFraction && allowDoubleZeros) {
      formattedFraction = fractionPart.delimiter + "00";
    }

    if (hasFraction && allowPaddingZeros && this.config.precision) {
      formattedFraction = formattedFraction.padEnd(this.config.precision.digit + 1, "0");
    }

    const currency = this.getSymbol();
    let formatted = "";
    let display = "";

    for (const part of this.getTemplate()) {
      switch (part.type) {
        case "custom":
          display += part.value;
          formatted += part.value;
          break;
        case "integer":
          display += formattedInteger;
          formatted += formattedInteger;
          break;
        case "fraction":
          if (formattedFraction) {
            display += formattedFraction;
            formatted += formattedFraction;
          }
          break;
        case "currency":
          display += currency;
          break;
      }
    }

    return {
      currency,
      value: money.amount,
      integer: formattedInteger,
      fraction: formattedFraction,
      formatted: formatted.trim(),
      display,
    };
  }

  format(money: number | Money): string {
    const parts = this.formatToParts(money);
    return parts.display;
  }

  private getCountryCode(): Countries {
    const { locale } = this.config;

    return (locale.includes("-") ? locale.split("-")[1] : locale) as Countries;
  }

  private getTemplate(): TemplatePart[] {
    const { locale } = this.config;
    const countryCode = this.getCountryCode();

    if (this.parsedTemplates[locale]) return this.parsedTemplates[locale];
    if (this.parsedTemplates[countryCode]) return this.parsedTemplates[countryCode];
    if (this.parsedTemplates["*"]) return this.parsedTemplates["*"];

    const parsed = this.parseDefaultTemplate();

    const formattedParts = parsed
      .filter((p) => intlPartHandlers[p.type])
      .map((p) => intlPartHandlers[p.type](p.value));

    return formattedParts;
  }

  private getSymbol() {
    const { locale, overridedSymbols } = this.config;
    const countryCode = this.getCountryCode();

    if (overridedSymbols[locale]) return overridedSymbols[locale];
    if (overridedSymbols[countryCode]) return overridedSymbols[countryCode];
    if (overridedSymbols["*"]) return overridedSymbols["*"];

    const parsed = this.parseDefaultTemplate();
    return parsed.find((p) => p.type === "currency")!.value;
  }

  private get trimDoubleZeros(): boolean {
    const { locale, trimDoubleZeros } = this.config;
    const countryCode = this.getCountryCode();

    if (typeof trimDoubleZeros === "boolean") return trimDoubleZeros;
    if (typeof trimDoubleZeros[locale] !== "undefined") return trimDoubleZeros[locale];
    if (typeof trimDoubleZeros[countryCode] !== "undefined") return trimDoubleZeros[countryCode];
    if (typeof trimDoubleZeros["*"] !== "undefined") return trimDoubleZeros["*"];

    return false;
  }

  private get trimPaddingZeros(): boolean {
    const { locale, trimPaddingZeros } = this.config;
    const countryCode = this.getCountryCode();

    if (typeof trimPaddingZeros === "boolean") return trimPaddingZeros;
    if (typeof trimPaddingZeros[locale] !== "undefined") return trimPaddingZeros[locale];
    if (typeof trimPaddingZeros[countryCode] !== "undefined") return trimPaddingZeros[countryCode];
    if (typeof trimPaddingZeros["*"] !== "undefined") return trimPaddingZeros["*"];

    return false;
  }

  // Helpers

  private parseDefaultTemplate(): Intl.NumberFormatPart[] {
    const countryCode = this.getCountryCode();
    const formatter = new Intl.NumberFormat(this.config.locale, {
      style: "currency",
      currency: countryToCurrency[countryCode],
      currencyDisplay: "symbol",
      maximumFractionDigits: 15,
    });

    return formatter.formatToParts(1234.567);
  }

  private parseTemplates(templates?: Record<string, string>): TemplateMap {
    const parsedTemplates: TemplateMap = {};

    if (!templates) return parsedTemplates;

    for (const part in templates) {
      parsedTemplates[part] = this.parseTemplate(templates[part]);
    }

    return parsedTemplates;
  }

  private parseTemplate(template: string): TemplatePart[] {
    let parts: TemplatePart[] = [];
    let lastIndex = 0;

    const matches = [...template.matchAll(TEMPLATE_PARSER_REGEX)];

    for (const match of matches) {
      if (match.index > lastIndex) {
        parts.push({
          type: "custom",
          value: template.slice(lastIndex, match.index),
        });
      }

      const content = match[1];
      const [type, ...rest] = content.split(TEMPLATE_OPTIONS_DELIMETER);

      parts.push(templateHandlers[type](rest));

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < template.length) {
      parts.push({ type: "custom", value: template.slice(lastIndex) });
    }

    return parts;
  }
}
