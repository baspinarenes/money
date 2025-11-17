import Big from 'big.js';
import { FormatOptions, FormatPart, RoundStrategy } from '../types';
import { normalizeCurrency, normalizeLocale, parseLocale } from '../utils/locale';
import { round } from '../utils/math';
import { formatWithTemplate, parseTemplate, TemplatePattern } from './template-parser';

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
      precision,
      preventGrouping,
    } = options;

    const normalizedLocale = normalizeLocale(locale);
    const normalizedCurrency = normalizeCurrency(currency, normalizedLocale);

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

