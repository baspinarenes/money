import Big from 'big.js';
import { FormatOptions, FormatPart, RoundStrategy } from '../types';
import { normalizeCurrency, normalizeLocale, parseLocale } from '../utils/locale';
import { round } from '../utils/math';
import { formatWithTemplate, parseTemplate } from './template-parser';

export class MoneyFormatter {
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

    if (templates) {
      const template = this.findTemplate(templates, localeParts);
      if (template) {
        const pattern = parseTemplate(template);
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
    }

    let valueToFormat = value;
    
    if (precision !== undefined) {
      const valueBig = new Big(value);
      const finalStrategy = roundingStrategy ?? RoundStrategy.NEAREST;
      const rounded = round(valueBig, precision, finalStrategy);
      valueToFormat = rounded.toNumber();
    }

    const intlOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: normalizedCurrency,
      useGrouping: !preventGrouping,
      ...(precision !== undefined && {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }),
    };

    const formatter = new Intl.NumberFormat(normalizedLocale, intlOptions);
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

    const intlOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: normalizedCurrency,
      useGrouping: !preventGrouping,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    };

    Object.keys(intlOptions).forEach((key) => {
      if (intlOptions[key as keyof Intl.NumberFormatOptions] === undefined) {
        delete intlOptions[key as keyof Intl.NumberFormatOptions];
      }
    });

    const formatter = new Intl.NumberFormat(normalizedLocale, intlOptions);
    return formatter.formatToParts(value).map((part) => ({
      type: part.type,
      value: part.value,
    }));
  }

  private static findTemplate(
    templates: Record<string, string>,
    localeParts: { language: string; country: string; culture: string }
  ): string | null {
    // Try culture first (e.g., "en-US")
    if (templates[localeParts.culture]) {
      return templates[localeParts.culture];
    }

    // Try country (e.g., "US")
    if (templates[localeParts.country]) {
      return templates[localeParts.country];
    }

    // Try language (e.g., "en")
    if (templates[localeParts.language]) {
      return templates[localeParts.language];
    }

    // Try default
    if (templates['default']) {
      return templates['default'];
    }

    return null;
  }

  private static getCurrencySymbol(currency: string, locale: string): string {
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      });
      const parts = formatter.formatToParts(0);
      const currencyPart = parts.find((part) => part.type === 'currency');
      return currencyPart?.value || currency;
    } catch {
      return currency;
    }
  }

  private static applyZeroTrimming(
    formatted: string,
    trimDoubleZeros?: boolean | Record<string, boolean>,
    trimPaddingZeros?: boolean | Record<string, boolean>
  ): string {
    let result = formatted;

    // Trim double zeros (e.g., $100.00 -> $100)
    if (trimDoubleZeros) {
      result = result.replace(/\.00(?=\s|$)/g, '');
    }

    // Trim padding zeros (e.g., $000100 -> $100)
    if (trimPaddingZeros) {
      result = result.replace(/^([^\d]*?)0+(\d)/, '$1$2');
    }

    return result;
  }
}

