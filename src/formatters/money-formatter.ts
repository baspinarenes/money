import Big from 'big.js';
import { FormatOptions, FormatPart, RoundStrategy } from '../types';
import { normalizeCurrency, normalizeLocale, parseLocale } from '../utils/locale';
import { round } from '../utils/math';
import { formatNumberParts, formatWithTemplate, parseTemplate, TemplatePattern } from './template-parser';

interface FormatterCacheKey {
  locale: string;
  currency: string;
  precision: number | undefined;
  preventGrouping: boolean;
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
    const {
      locale,
      currency,
      templates,
      trimDoubleZeros,
      trimPaddingZeros,
      precision,
      roundingStrategy,
      preventGrouping,
    } = options;

    const normalizedLocale = normalizeLocale(locale);
    const normalizedCurrency = normalizeCurrency(currency, normalizedLocale);
    const localeParts = parseLocale(normalizedLocale);
    const template = this.findTemplate(templates, localeParts);

    if (template) {
      const pattern = this.getTemplatePattern(template);
      const templatePrecision = precision ?? (pattern.numberPattern.decimalDigits > 0 ? pattern.numberPattern.decimalDigits : undefined);

      let valueToFormat = value;
      if (templatePrecision !== undefined) {
        const valueBig = new Big(value);
        const finalStrategy = roundingStrategy ?? RoundStrategy.NEAREST;
        const rounded = round(valueBig, templatePrecision, finalStrategy);
        valueToFormat = rounded.toNumber();
      }
      
      const symbol = this.getCurrencySymbol(normalizedCurrency, normalizedLocale);
      return formatWithTemplate(valueToFormat, pattern, symbol, templatePrecision ?? undefined);
    }

    let valueToFormat = value;
    
    if (precision !== undefined) {
      const valueBig = new Big(value);
      const finalStrategy = roundingStrategy ?? RoundStrategy.NEAREST;
      const rounded = round(valueBig, precision, finalStrategy);
      valueToFormat = rounded.toNumber();
    }

    const formatter = this.getFormatter({
      locale: normalizedLocale,
      currency: normalizedCurrency,
      precision,
      preventGrouping: preventGrouping ?? false,
    });
    
    let formatted = formatter.format(valueToFormat);

    if (trimDoubleZeros || trimPaddingZeros) {
      formatted = this.applyZeroTrimming(formatted, trimDoubleZeros, trimPaddingZeros);
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
      const pattern = this.getTemplatePattern(template);
      const templatePrecision = precision ?? (pattern.numberPattern.decimalDigits > 0 ? pattern.numberPattern.decimalDigits : undefined);

      let valueToFormat = value;
      if (templatePrecision !== undefined) {
        const valueBig = new Big(value);
        const finalStrategy = roundingStrategy ?? RoundStrategy.NEAREST;
        const rounded = round(valueBig, templatePrecision, finalStrategy);
        valueToFormat = rounded.toNumber();
      }

      const symbol = this.getCurrencySymbol(normalizedCurrency, normalizedLocale);
      const formattedString = formatWithTemplate(valueToFormat, pattern, symbol, templatePrecision ?? undefined);
      
      return this.parseFormattedStringToParts(formattedString, pattern, valueToFormat, symbol);
    }

    const formatter = this.getFormatter({
      locale: normalizedLocale,
      currency: normalizedCurrency,
      precision,
      preventGrouping: preventGrouping ?? false,
    });
    
    return formatter.formatToParts(value).map((part) => ({
      type: part.type,
      value: part.value,
    }));
  }

  private static parseFormattedStringToParts(formatted: string, pattern: TemplatePattern, value: number, symbol?: string): FormatPart[] {
    const parts: FormatPart[] = [];
    const symbolToUse = pattern.customSymbol || symbol || '';
    
    // Find symbol position in formatted string
    const symbolIndex = symbolToUse ? formatted.indexOf(symbolToUse) : -1;
    const isSymbolPrefix = symbolIndex >= 0 && symbolIndex < formatted.length / 2;
    
    // Use formatNumberParts to get properly formatted number
    const numberParts = formatNumberParts(value, pattern, pattern.numberPattern.decimalDigits);
    const formattedNumber = numberParts.formattedNumber;
    
    // Parse formatted number parts
    const decimalIndex = formattedNumber.indexOf(pattern.decimalSeparator);
    const integerPart = decimalIndex >= 0 ? formattedNumber.substring(0, decimalIndex) : formattedNumber;
    const decimalPart = decimalIndex >= 0 ? formattedNumber.substring(decimalIndex + 1) : '';
    
    // Remove negative sign if present
    const cleanIntegerPart = integerPart.replace(/^-/, '');
    
    // Split integer part by thousands separator
    const integerGroups = pattern.thousandsSeparator && cleanIntegerPart.includes(pattern.thousandsSeparator)
      ? cleanIntegerPart.split(pattern.thousandsSeparator)
      : [cleanIntegerPart];
    
    // Add negative sign if needed
    if (value < 0) {
      parts.push({ type: 'minusSign', value: '-' });
    }
    
    // Add currency symbol if prefix
    if (isSymbolPrefix && symbolToUse) {
      parts.push({ type: 'currency', value: symbolToUse });
    }
    
    // Add integer parts with group separators
    integerGroups.forEach((group, index) => {
      if (index > 0 && pattern.thousandsSeparator) {
        parts.push({ type: 'group', value: pattern.thousandsSeparator });
      }
      group.split('').forEach((digit) => {
        if (digit.match(/\d/)) {
          parts.push({ type: 'integer', value: digit });
        }
      });
    });
    
    // Add decimal separator and fraction
    if (decimalPart) {
      parts.push({ type: 'decimal', value: pattern.decimalSeparator });
      decimalPart.split('').forEach((digit) => {
        if (digit.match(/\d/)) {
          parts.push({ type: 'fraction', value: digit });
        }
      });
    }
    
    // Add currency symbol if suffix (with space if there's a space before it in formatted string)
    if (!isSymbolPrefix && symbolToUse) {
      // Check if there's a space before symbol in formatted string
      const spaceBeforeSymbol = symbolIndex > 0 && formatted[symbolIndex - 1] === ' ';
      if (spaceBeforeSymbol) {
        parts.push({ type: 'literal', value: ' ' });
      }
      parts.push({ type: 'currency', value: symbolToUse });
    }
    
    return parts;
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

