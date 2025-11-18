import Decimal from 'decimal.js-light';
import { FormatOptions, FormatPart, RoundStrategy } from '../types';
import { normalizeCurrency, normalizeLocale, parseLocale } from '../utils/locale';
import { round } from '../utils/math';
import { formatNumberParts, formatWithTemplate, parseTemplate, TemplatePattern } from './template-parser';

interface FormatterCacheKey {
  readonly locale: string;
  readonly currency: string;
  readonly precision: number | undefined;
  readonly preventGrouping: boolean;
}

export class MoneyFormatter {
  private static formatterCache = new Map<string, Intl.NumberFormat>();
  private static templatePatternCache = new Map<string, TemplatePattern>();
  private static symbolCache = new Map<string, string>();

  private static getFormatterCacheKey(key: FormatterCacheKey): string {
    return `${key.locale}|${key.currency}|${key.precision ?? 'undefined'}|${key.preventGrouping}`;
  }

  private static getFormatter(key: FormatterCacheKey): Intl.NumberFormat {
    const cacheKey = this.getFormatterCacheKey(key);
    
    let formatter = this.formatterCache.get(cacheKey);
    if (!formatter) {
      const intlOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: key.currency,
        useGrouping: !key.preventGrouping,
        ...(key.precision !== undefined && {
          minimumFractionDigits: key.precision,
          maximumFractionDigits: key.precision,
        }),
      };
      
      formatter = new Intl.NumberFormat(key.locale, intlOptions);
      this.formatterCache.set(cacheKey, formatter);
    }
    
    return formatter;
  }

  private static getTemplatePattern(template: string): TemplatePattern {
    let pattern = this.templatePatternCache.get(template);
    if (!pattern) {
      pattern = parseTemplate(template);
      this.templatePatternCache.set(template, pattern);
    }
    return pattern;
  }

  private static getCurrencySymbol(currency: string, locale: string): string {
    const cacheKey = `${currency}|${locale}`;
    
    let symbol = this.symbolCache.get(cacheKey);
    if (symbol === undefined) {
      try {
        const formatter = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        });
        const parts = formatter.formatToParts(0);
        const currencyPart = parts.find((part) => part.type === 'currency');
        symbol = currencyPart?.value || currency;
      } catch {
        symbol = currency;
      }
      this.symbolCache.set(cacheKey, symbol);
    }
    
    return symbol;
  }

  static clearCache(): void {
    this.formatterCache.clear();
    this.templatePatternCache.clear();
    this.symbolCache.clear();
  }

  static format(value: number, options: FormatOptions = {}): string {
    const parts = this.formatToParts(value, options);
    const formatted = parts.map((part) => part.value).join('');
    
    // Apply zero trimming if needed
    const { trimDoubleZeros, trimPaddingZeros } = options;
    if (trimDoubleZeros || trimPaddingZeros) {
      return this.applyZeroTrimming(formatted, trimDoubleZeros, trimPaddingZeros);
    }
    
    return formatted;
  }

  static formatToParts(value: number, options: FormatOptions = {}): FormatPart[] {
    const {
      locale,
      currency,
      templates,
      precision,
      roundingStrategy,
      preventGrouping,
    } = options;

    const normalizedLocale = normalizeLocale(locale);
    const normalizedCurrency = normalizeCurrency(currency, normalizedLocale);
    const localeParts = parseLocale(normalizedLocale);
    const template = this.findTemplate(templates, localeParts);

    if (template) {
      return this.formatToPartsWithTemplate(value, template, normalizedLocale, normalizedCurrency, precision, roundingStrategy);
    }

    return this.formatToPartsWithIntl(value, normalizedLocale, normalizedCurrency, precision, roundingStrategy, preventGrouping);
  }

  private static formatToPartsWithTemplate(
    value: number,
    template: string,
    normalizedLocale: string,
    normalizedCurrency: string,
    precision: number | undefined,
    roundingStrategy: RoundStrategy | undefined
  ): FormatPart[] {
    const pattern = this.getTemplatePattern(template);
    const templatePrecision = precision ?? (pattern.numberPattern.decimalDigits > 0 ? pattern.numberPattern.decimalDigits : undefined);

    const valueToFormat = this.applyRounding(value, templatePrecision, roundingStrategy);
    const symbol = this.getCurrencySymbol(normalizedCurrency, normalizedLocale);
    const formattedString = formatWithTemplate(valueToFormat, pattern, symbol, templatePrecision ?? undefined);
    
    return this.parseFormattedStringToParts(formattedString, pattern, valueToFormat, symbol);
  }

  private static formatToPartsWithIntl(
    value: number,
    normalizedLocale: string,
    normalizedCurrency: string,
    precision: number | undefined,
    roundingStrategy: RoundStrategy | undefined,
    preventGrouping: boolean | undefined
  ): FormatPart[] {
    const valueToFormat = this.applyRounding(value, precision, roundingStrategy);
    
    const formatter = this.getFormatter({
      locale: normalizedLocale,
      currency: normalizedCurrency,
      precision,
      preventGrouping: preventGrouping ?? false,
    });
    
    return formatter.formatToParts(valueToFormat).map((part) => ({
      type: part.type,
      value: part.value,
    }));
  }

  private static applyRounding(
    value: number,
    precision: number | undefined,
    roundingStrategy: RoundStrategy | undefined
  ): number {
    if (precision === undefined) {
      return value;
    }

    const valueDec = new Decimal(value);
    const finalStrategy = roundingStrategy ?? RoundStrategy.NEAREST;
    const rounded = round(valueDec, precision, finalStrategy);
    return rounded.toNumber();
  }

  private static parseFormattedStringToParts(formatted: string, pattern: TemplatePattern, value: number, symbol?: string): FormatPart[] {
    const parts: FormatPart[] = [];
    const symbolToUse = pattern.customSymbol || symbol || '';
    const numberParts = formatNumberParts(value, pattern, pattern.numberPattern.decimalDigits);
    
    const isSymbolPrefix = this.isSymbolAtPrefix(formatted, symbolToUse);
    if (isSymbolPrefix && symbolToUse) {
      parts.push({ type: 'currency', value: symbolToUse });
    }
    
    this.addIntegerParts(parts, numberParts.formattedNumber, pattern);
    this.addDecimalParts(parts, numberParts.formattedNumber, pattern);
    
    if (!isSymbolPrefix && symbolToUse) {
      this.addSuffixSymbol(parts, formatted, symbolToUse);
    }
    
    return parts;
  }

  private static isSymbolAtPrefix(formatted: string, symbol: string): boolean {
    if (!symbol) return false;
    const symbolIndex = formatted.indexOf(symbol);
    return symbolIndex >= 0 && symbolIndex < formatted.length / 2;
  }

  private static addIntegerParts(parts: FormatPart[], formattedNumber: string, pattern: TemplatePattern): void {
    const decimalIndex = formattedNumber.indexOf(pattern.decimalSeparator);
    const integerPart = decimalIndex >= 0 
      ? formattedNumber.substring(0, decimalIndex) 
      : formattedNumber;
    
    const cleanIntegerPart = integerPart.replace(/^-/, '');
    const integerGroups = pattern.thousandsSeparator && cleanIntegerPart.includes(pattern.thousandsSeparator)
      ? cleanIntegerPart.split(pattern.thousandsSeparator)
      : [cleanIntegerPart];
    
    integerGroups.forEach((group, index) => {
      if (index > 0 && pattern.thousandsSeparator) {
        parts.push({ type: 'group', value: pattern.thousandsSeparator });
      }
      for (const char of group) {
        if (/\d/.test(char)) {
          parts.push({ type: 'integer', value: char });
        }
      }
    });
  }

  private static addDecimalParts(parts: FormatPart[], formattedNumber: string, pattern: TemplatePattern): void {
    const decimalIndex = formattedNumber.indexOf(pattern.decimalSeparator);
    if (decimalIndex < 0) return;
    
    const decimalPart = formattedNumber.substring(decimalIndex + 1);
    if (!decimalPart) return;
    
    parts.push({ type: 'decimal', value: pattern.decimalSeparator });
    for (const char of decimalPart) {
      if (/\d/.test(char)) {
        parts.push({ type: 'fraction', value: char });
      }
    }
  }

  private static addSuffixSymbol(parts: FormatPart[], formatted: string, symbol: string): void {
    const symbolIndex = formatted.indexOf(symbol);
    const spaceBeforeSymbol = symbolIndex > 0 && formatted[symbolIndex - 1] === ' ';
    
    if (spaceBeforeSymbol) {
      parts.push({ type: 'literal', value: ' ' });
    }
    parts.push({ type: 'currency', value: symbol });
  }

  private static findTemplate(
    templates: Record<string, string> = {},
    localeParts: { language: string; country: string; culture: string }
  ): string | null {
    return (
      templates[localeParts.culture] ??
      templates[localeParts.country] ??
      templates[localeParts.language] ??
      templates["default"] ??
      null
    );
  }

  private static applyZeroTrimming(
    formatted: string,
    trimDoubleZeros?: boolean | Record<string, boolean>,
    trimPaddingZeros?: boolean | Record<string, boolean>
  ): string {
    let result = formatted;

    if (trimDoubleZeros) {
      result = result.replace(/\.00(?=\s|$)/g, '');
    }

    if (trimPaddingZeros) {
      result = result.replace(/^([^\d]*?)0+(\d)/, '$1$2');
    }

    return result;
  }
}

