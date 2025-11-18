import { describe, expect, it } from 'vitest';
import { Money } from '../../src/entities/money';
import { ComparisonResult, RoundStrategy } from '../../src/types';

describe('Money tests', () => {
  describe('Constructor tests', () => {
    it.each([
      [100, 100],
      ['100.50', 100.5],
      [0, 0],
      ['0.001', 0.001],
      [100.99, 100.99],
    ])('should create Money from %s', (input, expected) => {
      const money = new Money(input);
      expect(money.value).toBe(expected);
    });

    it('should clone Money instance', () => {
      const original = new Money(100);
      const cloned = new Money(original);
      expect(cloned.value).toBe(original.value);
      expect(cloned).not.toBe(original);
    });

    it('should throw error for invalid input', () => {
      expect(() => new Money('invalid' as any)).toThrow();
    });
  });

  describe('Properties tests', () => {
    it('should return correct value', () => {
      const money = new Money(100.50);
      expect(money.value).toBe(100.5);
    });

    it('should return correct amount', () => {
      const money = new Money(100.50);
      expect(money.amount).toBe(100.5);
    });
  });

  describe('Chainable operations tests', () => {
    it('should chain multiple operations', () => {
      const result = new Money(100)
        .add(50)
        .multiply(2)
        .subtract(25)
        .divide(5);
      expect(result.value).toBe(55);
    });

    it('should chain with discount', () => {
      const result = new Money(100)
        .add(50)
        .discount(10)
        .multiply(2);
      expect(result.value).toBe(270);
    });
  });

  describe('add() method tests', () => {
    it.each([
      [100, 50, 150],
      [100.50, 50.25, 150.75],
      [100, -50, 50],
      [0, 100, 100],
      [100, '50', 150],
      [100, new Money(50), 150],
    ])('should add %s and %s to get %s', (a, b, expected) => {
      const money = new Money(a);
      const result = money.add(b);
      expect(result.value).toBe(expected);
      expect(result).not.toBe(money);
    });
  });

  describe('subtract() method tests', () => {
    it.each([
      [100, 50, 50],
      [100.50, 50.25, 50.25],
      [100, -50, 150],
      [0, 100, -100],
      [100, '50', 50],
      [100, new Money(50), 50],
    ])('should subtract %s from %s to get %s', (a, b, expected) => {
      const money = new Money(a);
      const result = money.subtract(b);
      expect(result.value).toBe(expected);
    });
  });

  describe('multiply() method tests', () => {
    it.each([
      [100, 2, 200],
      [100.50, 2, 201],
      [100, 0, 0],
      [100, -2, -200],
      [100, '1.5', 150],
      [100, 0.5, 50],
    ])('should multiply %s by %s to get %s', (a, factor, expected) => {
      const money = new Money(a);
      const result = money.multiply(factor);
      expect(result.value).toBe(expected);
    });
  });

  describe('divide() method tests', () => {
    it.each([
      [100, 2, 50],
      [100.50, 2, 50.25],
      [100, 4, 25],
      [100, '2', 50],
      [100, 0.5, 200],
    ])('should divide %s by %s to get %s', (a, divisor, expected) => {
      const money = new Money(a);
      const result = money.divide(divisor);
      expect(result.value).toBe(expected);
    });

    it('should throw error when dividing by zero', () => {
      const money = new Money(100);
      expect(() => money.divide(0)).toThrow('Division by zero');
    });
  });

  describe('round() method tests', () => {
    it.each([
      [100.456, 2, RoundStrategy.NEAREST, 100.46],
      [100.454, 2, RoundStrategy.NEAREST, 100.45],
      [100.456, 2, RoundStrategy.UP, 100.46],
      [100.451, 2, RoundStrategy.UP, 100.46],
      [100.459, 2, RoundStrategy.DOWN, 100.45],
      [100.451, 2, RoundStrategy.DOWN, 100.45],
    ])('should round %s to %d decimals using %s', (value, precision, strategy, expected) => {
      const money = new Money(value);
      const result = money.round(precision, strategy);
      expect(result.value).toBe(expected);
    });

    it('should use default precision and strategy when not provided', () => {
      const money = new Money(100.456);
      const result = money.round();
      expect(result.value).toBe(100.46);
    });
  });

  describe('discount() method tests', () => {
    it.each([
      [100, 10, 90],
      [100, 25, 75],
      [1000, 15, 850],
      [100, '10.5', 89.5],
      [0, 10, 0],
    ])('should apply %s%% discount to %s to get %s', (value, percentage, expected) => {
      const money = new Money(value);
      const result = money.discount(percentage);
      expect(result.value).toBe(expected);
    });
  });

  describe('equal() method tests', () => {
    it.each([
      [100, 100, true],
      [100, 50, false],
      [100.50, 100.50, true],
      [100, '100', true],
      [100, new Money(100), true],
      [0, 0, true],
      [-100, -100, true],
    ])('should check if %s equals %s', (a, b, expected) => {
      const money = new Money(a);
      expect(money.equal(b)).toBe(expected);
    });
  });

  describe('compare() method tests', () => {
    it.each([
      [100, 50, ComparisonResult.GREATER_THAN],
      [50, 100, ComparisonResult.LESS_THAN],
      [100, 100, ComparisonResult.EQUAL],
      [0, 0, ComparisonResult.EQUAL],
      [-100, -50, ComparisonResult.LESS_THAN],
    ])('should compare %s and %s', (a, b, expected) => {
      const money = new Money(a);
      expect(money.compare(b)).toBe(expected);
    });
  });

  describe('isZero() method tests', () => {
    it.each([
      [0, true],
      [100, false],
      [-100, false],
      ['0', true],
    ])('should check if %s is zero', (value, expected) => {
      const money = new Money(value);
      expect(money.isZero()).toBe(expected);
    });
  });

  describe('isPositive() method tests', () => {
    it.each([
      [100, true],
      [0, false],
      [-100, false],
      [0.01, true],
    ])('should check if %s is positive', (value, expected) => {
      const money = new Money(value);
      expect(money.isPositive()).toBe(expected);
    });
  });

  describe('isNegative() method tests', () => {
    it.each([
      [-100, true],
      [0, false],
      [100, false],
      [-0.01, true],
    ])('should check if %s is negative', (value, expected) => {
      const money = new Money(value);
      expect(money.isNegative()).toBe(expected);
    });
  });

  describe('abs() method tests', () => {
    it.each([
      [100, 100],
      [0, 0],
    ])('should get absolute value of %s', (value, expected) => {
      const money = new Money(value);
      const result = money.abs();
      expect(result.value).toBe(expected);
    });
  });

  describe('toNumber() method tests', () => {
    it.each([
      [100, 100],
      [100.50, 100.5],
      [0, 0],
    ])('should convert %s to number', (value, expected) => {
      const money = new Money(value);
      expect(money.toNumber()).toBe(expected);
    });
  });

  describe('toString() method tests', () => {
    it.each([
      [100, '100'],
      [100.50, '100.5'],
      [0, '0'],
    ])('should convert %s to string', (value, expected) => {
      const money = new Money(value);
      expect(money.toString()).toBe(expected);
    });
  });

  describe('toJSON() method tests', () => {
    it('should return string representation', () => {
      const money = new Money(100.50);
      expect(money.toJSON()).toBe('100.5');
    });
  });

  describe('formatToComponents() method tests', () => {
    describe('Basic formatting tests', () => {
      it('should return correct components for US format', () => {
        const money = new Money(1000.50);
        const components = money.formatToComponents({ locale: 'en-US', currency: 'USD' });

        expect(components.currency).toBe('$');
        expect(components.groupDelimiter).toBe(',');
        expect(components.decimalDelimiter).toBe('.');
        expect(components.formatted).toBe('1,000.50');
        expect(components.formattedWithSymbol).toBe('$1,000.50');
      });

      it('should return correct components for German format', () => {
        const money = new Money(1000.50);
        const components = money.formatToComponents({ locale: 'de-DE', currency: 'EUR' });

        expect(components.currency).toBe('€');
        expect(components.groupDelimiter).toBe('.');
        expect(components.decimalDelimiter).toBe(',');
        expect(components.formatted).toContain('1.000,50');
        expect(components.formattedWithSymbol).toContain('€');
      });

      it('should return correct components for Turkish format', () => {
        const money = new Money(1000.50);
        const components = money.formatToComponents({ locale: 'tr-TR', currency: 'TRY' });

        expect(components.currency).toBe('₺');
        expect(components.groupDelimiter).toBe('.');
        expect(components.decimalDelimiter).toBe(',');
        expect(components.formatted).toBe('1.000,50');
        expect(components.formattedWithSymbol).toBe('₺1.000,50');
      });

      it('should return correct components for Japanese format', () => {
        const money = new Money(1000);
        const components = money.formatToComponents({ locale: 'ja-JP', currency: 'JPY' });

        expect(components.currency).toBe('￥');
        expect(components.formattedWithSymbol).toContain('￥');
      });
    });

    describe('Different values tests', () => {
      it.each([
        [100, '100.00', '$100.00'],
        [1000.5, '1,000.50', '$1,000.50'],
        [1234567.89, '1,234,567.89', '$1,234,567.89'],
        [0, '0.00', '$0.00'],
        [0.01, '0.01', '$0.01'],
      ])('should format %s correctly', (value, expectedFormatted, expectedWithSymbol) => {
        const money = new Money(value);
        const components = money.formatToComponents({ locale: 'en-US', currency: 'USD' });

        expect(components.formatted).toBe(expectedFormatted);
        expect(components.formattedWithSymbol).toBe(expectedWithSymbol);
      });
    });

    describe('Precision tests', () => {
      it('should respect precision option', () => {
        const money = new Money(100.456);
        const components = money.formatToComponents({
          locale: 'en-US',
          currency: 'USD',
          precision: 2,
        });

        expect(components.formatted).toBe('100.46');
        expect(components.formattedWithSymbol).toBe('$100.46');
      });

      it('should respect precision 0', () => {
        const money = new Money(100.99);
        const components = money.formatToComponents({
          locale: 'en-US',
          currency: 'USD',
          precision: 0,
        });

        expect(components.formatted).toBe('101');
        expect(components.formattedWithSymbol).toBe('$101');
      });

      it('should respect precision 3', () => {
        const money = new Money(100.4567);
        const components = money.formatToComponents({
          locale: 'en-US',
          currency: 'USD',
          precision: 3,
        });

        expect(components.formatted).toBe('100.457');
        expect(components.formattedWithSymbol).toBe('$100.457');
      });
    });

    describe('Prevent grouping tests', () => {
      it('should handle preventGrouping option', () => {
        const money = new Money(1000000.50);
        const components = money.formatToComponents({
          locale: 'en-US',
          currency: 'USD',
          preventGrouping: true,
        });

        expect(components.groupDelimiter).toBe('');
        expect(components.formatted).toBe('1000000.50');
        expect(components.formattedWithSymbol).toBe('$1000000.50');
      });
    });

    describe('Currency override tests', () => {
      it('should override currency while keeping locale format', () => {
        const money = new Money(1000.50);
        const components = money.formatToComponents({
          locale: 'tr-TR',
          currency: 'USD',
        });

        expect(components.currency).toBe('$');
        expect(components.groupDelimiter).toBe('.');
        expect(components.decimalDelimiter).toBe(',');
        expect(components.formatted).toBe('1.000,50');
        expect(components.formattedWithSymbol).toBe('$1.000,50');
      });

      it('should override currency for German locale', () => {
        const money = new Money(1000.50);
        const components = money.formatToComponents({
          locale: 'de-DE',
          currency: 'TRY',
        });

        expect(['₺', 'TRY']).toContain(components.currency);
        expect(components.groupDelimiter).toBe('.');
        expect(components.decimalDelimiter).toBe(',');
        expect(
          components.formattedWithSymbol.includes('₺') ||
          components.formattedWithSymbol.includes('TRY')
        ).toBe(true);
      });
    });

    describe('Structure validation tests', () => {
      it('should return all required properties', () => {
        const money = new Money(1000.50);
        const components = money.formatToComponents({ locale: 'en-US', currency: 'USD' });

        expect(components).toHaveProperty('currency');
        expect(components).toHaveProperty('groupDelimiter');
        expect(components).toHaveProperty('decimalDelimiter');
        expect(components).toHaveProperty('formatted');
        expect(components).toHaveProperty('formattedWithSymbol');
      });

      it('should have formattedWithSymbol containing currency and formatted', () => {
        const money = new Money(1000.50);
        const components = money.formatToComponents({ locale: 'en-US', currency: 'USD' });

        expect(components.formattedWithSymbol).toContain(components.currency);
        const formattedNumber = components.formatted.replace(/[,.]/g, '');
        const formattedWithSymbolNumber = components.formattedWithSymbol.replace(/[^0-9]/g, '');
        expect(formattedWithSymbolNumber).toContain(formattedNumber);
      });

      it('should have formatted without currency symbol', () => {
        const money = new Money(1000.50);
        const components = money.formatToComponents({ locale: 'en-US', currency: 'USD' });

        expect(components.formatted).not.toContain(components.currency);
      });
    });

    describe('Edge cases tests', () => {
      it('should handle zero value', () => {
        const money = new Money(0);
        const components = money.formatToComponents({ locale: 'en-US', currency: 'USD' });

        expect(components.currency).toBe('$');
        expect(components.formatted).toBe('0.00');
        expect(components.formattedWithSymbol).toBe('$0.00');
      });

      it('should handle negative values', () => {
        const money = new Money(-1000.50);
        const components = money.formatToComponents({ locale: 'en-US', currency: 'USD' });

        expect(components.formatted).toContain('-');
        expect(components.formattedWithSymbol).toContain('-');
      });

      it('should handle very large numbers', () => {
        const money = new Money(999999999.99);
        const components = money.formatToComponents({ locale: 'en-US', currency: 'USD' });

        expect(components.formatted).toContain('999,999,999.99');
        expect(components.formattedWithSymbol).toContain('$');
      });

      it('should handle very small numbers', () => {
        const money = new Money(0.01);
        const components = money.formatToComponents({ locale: 'en-US', currency: 'USD' });

        expect(components.formatted).toBe('0.01');
        expect(components.formattedWithSymbol).toBe('$0.01');
      });
    });

    describe('Multiple locale tests', () => {
      it.each([
        ['en-US', 'USD', '$', ',', '.'],
        ['de-DE', 'EUR', '€', '.', ','],
        ['tr-TR', 'TRY', '₺', '.', ','],
        ['ja-JP', 'JPY', '￥', ',', '.'],
      ])(
        'should format correctly for locale %s with currency %s',
        (locale, currency, expectedCurrency, expectedGroup, expectedDecimal) => {
          const money = new Money(1234.56);
          const components = money.formatToComponents({ locale, currency });

          expect(components.currency).toBe(expectedCurrency);
          expect(components.groupDelimiter).toBe(expectedGroup);
          expect(components.decimalDelimiter).toBe(expectedDecimal);
        }
      );

      it('should format correctly for French locale', () => {
        const money = new Money(1234.56);
        const components = money.formatToComponents({ locale: 'fr-FR', currency: 'EUR' });

        expect(components.currency).toBe('€');
        expect(components.groupDelimiter.length).toBeGreaterThan(0);
        expect(components.decimalDelimiter).toBe(',');
      });
    });

    describe('Consistency with format() tests', () => {
      it('should return formattedWithSymbol matching format() output', () => {
        const money = new Money(1000.50);
        const options = { locale: 'en-US', currency: 'USD' };

        const formatted = money.format(options);
        const components = money.formatToComponents(options);

        expect(components.formattedWithSymbol).toBe(formatted);
      });

      it('should be consistent across multiple calls', () => {
        const money = new Money(1000.50);
        const options = { locale: 'en-US', currency: 'USD' };

        const components1 = money.formatToComponents(options);
        const components2 = money.formatToComponents(options);

        expect(components1).toEqual(components2);
      });
    });

    describe('Template support tests', () => {
      it('should work with templates', () => {
        const money = new Money(5000.99);
        const components = money.formatToComponents({
          locale: 'en-US',
          currency: 'USD',
          templates: {
            'en-US': '{Symbol} 1,000.00',
          },
        });

        expect(components.currency).toBe('$');
        expect(components.formattedWithSymbol).toContain('$');
        expect(components.formattedWithSymbol).toContain('5,000.99');
      });
    });
  });

  describe('Turkish TL format tests', () => {
    it('should convert price to TRY format with TL symbol', () => {
      const price1 = new Money(97.65);
      const price2 = new Money(1234.56);
      const price3 = new Money(25.0);
      const price4 = new Money(0);
      const price5 = new Money(1234567890);

      const formatOptions = {
        locale: 'tr-TR',
        currency: 'TRY',
      };

      expect(price1.format(formatOptions)).toBe('₺97,65');
      expect(price2.format(formatOptions)).toBe('₺1.234,56');
      expect(price3.format(formatOptions)).toBe('₺25,00');
      expect(price4.format(formatOptions)).toBe('₺0,00');
      expect(price5.format(formatOptions)).toBe('₺1.234.567.890,00');

      const templates = {
        default: '1.000,00 {Symbol:TL}',
      };

      expect(price1.format({...formatOptions, templates})).toBe('97,65 TL');
      expect(price2.format({...formatOptions, templates})).toBe('1.234,56 TL');
      expect(price3.format({...formatOptions, templates})).toBe('25,00 TL');
      expect(price4.format({...formatOptions, templates})).toBe('0,00 TL');
      expect(price5.format({...formatOptions, templates})).toBe('1.234.567.890,00 TL');
    });
  });
});

