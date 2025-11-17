import { describe, expect, it } from 'vitest';
import { formatWithTemplate, parseTemplate } from '../../src/formatters/template-parser';

describe('Template Parser tests', () => {
  describe('parseTemplate() tests', () => {
    it.each([
      [
        '{Symbol} 5.000.00,50',
        {
          symbolPosition: 'prefix',
          thousandsSeparator: '.',
          decimalSeparator: ',',
          numberPattern: {
            integerDigits: 6, // 5.000.00 has 6 digits: 5,0,0,0,0,0
            decimalDigits: 2,
            hasGrouping: true,
          },
        },
      ],
      [
        '{Symbol} 5,000.50',
        {
          symbolPosition: 'prefix',
          thousandsSeparator: ',',
          decimalSeparator: '.',
          numberPattern: {
            integerDigits: 4,
            decimalDigits: 2,
            hasGrouping: true,
          },
        },
      ],
      [
        '5.000,50 {Symbol}',
        {
          symbolPosition: 'suffix',
          thousandsSeparator: '.',
          decimalSeparator: ',',
          numberPattern: {
            integerDigits: 4,
            decimalDigits: 2,
            hasGrouping: true,
          },
        },
      ],
      [
        '{Symbol} 100',
        {
          symbolPosition: 'prefix',
          thousandsSeparator: '',
          decimalSeparator: '.',
          numberPattern: {
            integerDigits: 3,
            decimalDigits: 0,
            hasGrouping: false,
          },
        },
      ],
    ])('should parse template %s correctly', (template, expected) => {
      const pattern = parseTemplate(template);
      expect(pattern.symbolPosition).toBe(expected.symbolPosition);
      expect(pattern.thousandsSeparator).toBe(expected.thousandsSeparator);
      expect(pattern.decimalSeparator).toBe(expected.decimalSeparator);
      expect(pattern.numberPattern.integerDigits).toBe(expected.numberPattern.integerDigits);
      expect(pattern.numberPattern.decimalDigits).toBe(expected.numberPattern.decimalDigits);
      expect(pattern.numberPattern.hasGrouping).toBe(expected.numberPattern.hasGrouping);
    });

    it('should detect spaces in template', () => {
      const pattern = parseTemplate('{Symbol} 5.000,50');
      expect(pattern.spaces.length).toBeGreaterThan(0);
    });

    it('should preserve template structure', () => {
      const template = '{Symbol} 5.000,50';
      const pattern = parseTemplate(template);
      expect(pattern.structure).toBe(template);
    });
  });

  describe('formatWithTemplate() tests', () => {
    it.each([
      [5000.99, '{Symbol} 5.000,50', '$', '$ 5.000,99'],
      [1000.50, '{Symbol} 1,000.50', '$', '$ 1,000.50'],
      [100, '{Symbol} 100', '$', '$ 100'],
      [0, '{Symbol} 0', '$', '$ 0'],
    ])('should format %s with template %s', (value, template, symbol, expected) => {
      const pattern = parseTemplate(template);
      const result = formatWithTemplate(value, pattern, symbol);
      expect(result).toBe(expected);
    });

    it('should handle negative values', () => {
      const pattern = parseTemplate('{Symbol} 5.000,50');
      const result = formatWithTemplate(-5000.99, pattern, '$');
      expect(result).toContain('-');
    });

    it('should respect decimal digits from template', () => {
      const pattern = parseTemplate('{Symbol} 5.000,50'); // 2 decimal digits
      const result = formatWithTemplate(5000.999, pattern, '$', 2);
      expect(result).toMatch(/\d{2}$/); // Ends with 2 digits
    });
  });
});

