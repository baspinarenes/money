import { LOG_PREFIX, TEMPLATE_OPTIONS_DELIMETER, TEMPLATE_PARSER_REGEX } from "@constants";
import type { MoneyFormatterOptions, MoneyFormat, TemplateMap, TemplatePart } from "@types";
import { formatIntegerWithDelimiter, intlPartHandlers, isValidLocale, templateHandlers } from "@utils";
import { Money } from "./money";
import { RoundStrategy } from "@enums";
import countryToCurrency, { Countries } from "country-to-currency";

export class MoneyFormatter {
  private options: {
    locale: string;
    templates: TemplateMap;
    overridedSymbols: Record<string, string>;
    trailingZeroDisplay: boolean | Record<string, boolean>;
    roundStrategy: RoundStrategy;
    precision?: number;
    preventGrouping?: boolean;
  };

  constructor(options: MoneyFormatterOptions) {
    const locale = options.locale;

    if (!locale || !isValidLocale(locale)) {
      throw new Error(`${LOG_PREFIX} Invalid locale: ${locale}`);
    }

    this.options = {
      locale,
      overridedSymbols: options?.overridedSymbols || {},
      trailingZeroDisplay: options?.trailingZeroDisplay || {},
      templates: this.parseTemplates(options?.templates),
      precision: options?.precision,
      roundStrategy: (options.roundStrategy as RoundStrategy) || RoundStrategy.DOWN,
      preventGrouping: options?.preventGrouping || false,
    };
  }

  static create(options: MoneyFormatterOptions) {
    return new MoneyFormatter(options);
  }

  formatToParts(_money: number | Money, formatOptions?: Partial<typeof this.options>): MoneyFormat {
    let money = _money instanceof Money ? _money : new Money(_money);

    const options = { ...this.options, ...formatOptions };

    const fractionPart = this.getTemplate(options).find((p) => p.type === "fraction")!;
    const integerPart = this.getTemplate(options).find((p) => p.type === "integer")!;

    let manipulatedMoney = money;

    if (fractionPart.precision || options.precision) {
      manipulatedMoney = money.round((fractionPart.precision || options.precision)!, options.roundStrategy);
    }

    const formattedInteger = options.preventGrouping
      ? String(manipulatedMoney.integer)
      : formatIntegerWithDelimiter(manipulatedMoney.integer, integerPart.delimiter);

    let formattedFraction = manipulatedMoney.fraction
      ? `${fractionPart.delimiter}${manipulatedMoney.formattedFraction}`
      : "";

    if (!formattedFraction && !this.getTrailingZeroDisplay(options)) {
      formattedFraction = fractionPart.delimiter + "00";
    }

    const currency = this.getSymbol(options);
    let formatted = "";
    let display = "";

    for (const part of this.getTemplate(options)) {
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

  format(money: number | Money, formatOptions?: Partial<typeof this.options>): string {
    const parts = this.formatToParts(money, formatOptions);
    return parts.display;
  }

  private getCountryCode(locale: string): Countries {
    return (locale.includes("-") ? locale.split("-")[1] : locale) as Countries;
  }

  private getTemplate(options: typeof this.options): TemplatePart[] {
    const { templates, locale } = options;
    const countryCode = this.getCountryCode(locale);

    if (templates[locale]) return templates[locale];
    if (templates[countryCode]) return templates[countryCode];
    if (templates["*"]) return templates["*"];

    const parsed = this.parseDefaultTemplate(options);

    const formattedParts = parsed.filter((p) => intlPartHandlers[p.type]).map((p) => intlPartHandlers[p.type](p.value));

    return formattedParts;
  }

  private getSymbol(options: typeof this.options) {
    const { locale, overridedSymbols } = options;
    const countryCode = this.getCountryCode(locale);

    if (overridedSymbols[locale]) return overridedSymbols[locale];
    if (overridedSymbols[countryCode]) return overridedSymbols[countryCode];
    if (overridedSymbols["*"]) return overridedSymbols["*"];

    const parsed = this.parseDefaultTemplate(options);
    return parsed.find((p) => p.type === "currency")!.value;
  }

  private getTrailingZeroDisplay(options: typeof this.options): boolean {
    const { locale, trailingZeroDisplay } = options;
    const countryCode = this.getCountryCode(locale);

    if (typeof trailingZeroDisplay === "boolean") return trailingZeroDisplay;
    if (typeof trailingZeroDisplay[locale] !== "undefined") return trailingZeroDisplay[locale];
    if (typeof trailingZeroDisplay[countryCode] !== "undefined") return trailingZeroDisplay[countryCode];
    if (typeof trailingZeroDisplay["*"] !== "undefined") return trailingZeroDisplay["*"];

    return false;
  }

  // Helpers

  private parseDefaultTemplate(options: typeof this.options): Intl.NumberFormatPart[] {
    const countryCode = this.getCountryCode(options.locale);
    const formatter = new Intl.NumberFormat(options.locale, {
      style: "currency",
      currency: countryToCurrency[countryCode],
      currencyDisplay: "symbol",
      maximumFractionDigits: 15,
      ...{
        trailingZeroDisplay: this.getTrailingZeroDisplay(options) ? "stripIfInteger" : "auto",
      },
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
