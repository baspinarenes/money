import { describe, expect, it } from 'vitest';
import {
  getDefaultCurrency,
  getDefaultLocale,
  normalizeCurrency,
  normalizeLocale,
  parseLocale,
} from '../../src/utils/locale';

describe('Locale Utils tests', () => {
  describe('getDefaultLocale() tests', () => {
    it('should return browser locale when navigator is available', () => {
      const originalNavigator = global.navigator;
      // @ts-ignore
      global.navigator = { language: 'tr-TR' };
      
      const locale = getDefaultLocale();
      expect(locale).toBe('tr-TR');
      
      global.navigator = originalNavigator;
    });

    it('should return Intl locale when navigator is not available', () => {
      const originalNavigator = global.navigator;
      // @ts-ignore
      global.navigator = undefined;
      
      const locale = getDefaultLocale();
      expect(typeof locale).toBe('string');
      expect(locale.length).toBeGreaterThan(0);
      
      global.navigator = originalNavigator;
    });

    it('should return en-US as fallback', () => {
      const originalNavigator = global.navigator;
      const originalIntl = global.Intl;
      // @ts-ignore
      global.navigator = undefined;
      // @ts-ignore
      global.Intl = undefined;
      
      const locale = getDefaultLocale();
      expect(locale).toBe('en-US');
      
      global.navigator = originalNavigator;
      global.Intl = originalIntl;
    });
  });

  describe('getDefaultCurrency() tests', () => {
    it.each([
      ['en-US', 'USD'],
      ['en-GB', 'GBP'],
      ['de-DE', 'EUR'],
      ['tr-TR', 'TRY'],
      ['ja-JP', 'JPY'],
      ['fr-FR', 'EUR'],
      ['pt-BR', 'BRL'],
    ])('should return correct currency for locale %s', (locale, expected) => {
      expect(getDefaultCurrency(locale)).toBe(expected);
    });

    it('should match by language code when exact match not found', () => {
      expect(getDefaultCurrency('en-XX')).toBe('USD'); // Matches 'en' prefix
    });

    it('should return USD as default', () => {
      expect(getDefaultCurrency('unknown-LOCALE')).toBe('USD');
    });
  });

  describe('normalizeLocale() tests', () => {
    it('should return provided locale', () => {
      expect(normalizeLocale('tr-TR')).toBe('tr-TR');
      expect(normalizeLocale('en-US')).toBe('en-US');
    });

    it('should return default locale when not provided', () => {
      const locale = normalizeLocale();
      expect(typeof locale).toBe('string');
      expect(locale.length).toBeGreaterThan(0);
    });
  });

  describe('normalizeCurrency() tests', () => {
    it('should uppercase provided currency', () => {
      expect(normalizeCurrency('usd')).toBe('USD');
      expect(normalizeCurrency('eur')).toBe('EUR');
      expect(normalizeCurrency('TRY')).toBe('TRY');
    });

    it('should get currency from locale when not provided', () => {
      expect(normalizeCurrency(undefined, 'en-US')).toBe('USD');
      expect(normalizeCurrency(undefined, 'tr-TR')).toBe('TRY');
    });

    it('should use default locale when locale not provided', () => {
      const currency = normalizeCurrency();
      expect(typeof currency).toBe('string');
      expect(currency.length).toBe(3);
    });
  });

  describe('parseLocale() tests', () => {
    it.each([
      ['en-US', { language: 'en', country: 'US', culture: 'en-US' }],
      ['tr-TR', { language: 'tr', country: 'TR', culture: 'tr-TR' }],
      ['de-DE', { language: 'de', country: 'DE', culture: 'de-DE' }],
      ['fr', { language: 'fr', country: 'US', culture: 'fr' }],
      ['en', { language: 'en', country: 'US', culture: 'en' }],
    ])('should parse locale %s correctly', (locale, expected) => {
      const result = parseLocale(locale);
      expect(result).toEqual(expected);
    });
  });
});

