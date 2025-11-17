/**
 * Template Parser
 * Parses template strings like "{Symbol} 5.000.00,50" and extracts formatting pattern
 * Builds template structure to format numbers according to template layout
 */

export interface TemplatePattern {
  /** Symbol position: 'prefix' | 'suffix' */
  symbolPosition: 'prefix' | 'suffix';
  /** Symbol placeholder text */
  symbolPlaceholder: string;
  /** Thousands separator character */
  thousandsSeparator: string;
  /** Decimal separator character */
  decimalSeparator: string;
  /** Spaces positions (array of character positions in template) */
  spaces: number[];
  /** Template structure for reconstruction */
  structure: string;
  /** Parsed number pattern parts */
  numberPattern: {
    integerDigits: number;
    decimalDigits: number;
    hasGrouping: boolean;
  };
}

/**
 * Parse template string to extract formatting pattern
 * Example: "{Symbol} 5.000.00,50" -> pattern with symbol prefix, dots, comma, spaces
 */
export function parseTemplate(template: string): TemplatePattern {
  // Find symbol placeholder position
  const symbolMatch = template.match(/\{Symbol\}/i);
  const symbolIndex = symbolMatch ? symbolMatch.index! : -1;
  const symbolPosition: 'prefix' | 'suffix' = symbolIndex < template.length / 2 ? 'prefix' : 'suffix';

  // Extract number part (remove symbol placeholder)
  const numberPart = template.replace(/\{Symbol\}/gi, '').trim();

  // Detect separators by analyzing number pattern
  // First detect decimal separator (more reliable)
  const decimalSeparator = detectDecimalSeparator(numberPart);
  // Then detect thousands separator from integer part only
  const thousandsSeparator = detectThousandsSeparator(numberPart, decimalSeparator);

  // Find all space positions in original template
  const spaces: number[] = [];
  let searchIndex = 0;
  let spaceIndex = template.indexOf(' ', searchIndex);
  while (spaceIndex !== -1) {
    spaces.push(spaceIndex);
    searchIndex = spaceIndex + 1;
    spaceIndex = template.indexOf(' ', searchIndex);
  }

  // Analyze number pattern structure
  const numberPattern = analyzeNumberPattern(numberPart, thousandsSeparator, decimalSeparator);

  return {
    symbolPosition,
    symbolPlaceholder: '{Symbol}',
    thousandsSeparator,
    decimalSeparator,
    spaces,
    structure: template,
    numberPattern,
  };
}

/**
 * Analyze number pattern to extract structure info
 */
function analyzeNumberPattern(
  numberPart: string,
  thousandsSeparator: string,
  decimalSeparator: string
): { integerDigits: number; decimalDigits: number; hasGrouping: boolean } {
  const parts = numberPart.split(decimalSeparator);
  const integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';

  // Count digits (excluding separators)
  const integerDigits = integerPart.replace(/[^\d]/g, '').length;
  const decimalDigits = decimalPart.replace(/[^\d]/g, '').length;
  const hasGrouping = thousandsSeparator !== '' && integerPart.includes(thousandsSeparator);

  return {
    integerDigits,
    decimalDigits,
    hasGrouping,
  };
}

/**
 * Detect thousands separator from number pattern
 * Uses decimal separator to correctly identify integer part
 */
function detectThousandsSeparator(numberPart: string, decimalSeparator: string): string {
  // Split by decimal separator to get integer part
  const integerPart = decimalSeparator 
    ? numberPart.split(decimalSeparator)[0] || numberPart
    : numberPart;

  // Count occurrences of each separator in integer part
  const dotCount = (integerPart.match(/\./g) || []).length;
  const commaCount = (integerPart.match(/,/g) || []).length;

  // If decimal separator is comma, then dot is thousands separator
  if (decimalSeparator === ',' && dotCount > 0) {
    return '.';
  }

  // If decimal separator is dot, then comma is thousands separator
  if (decimalSeparator === '.' && commaCount > 0) {
    return ',';
  }

  // If both dot and comma exist, use the one that's NOT the decimal separator
  if (dotCount > 0 && commaCount > 0) {
    return decimalSeparator === ',' ? '.' : ',';
  }

  // Check for dot (most common in European)
  if (integerPart.includes('.') && decimalSeparator !== '.') {
    return '.';
  }

  // Check for comma (US style, but also used in some locales)
  if (integerPart.includes(',') && decimalSeparator !== ',') {
    return ',';
  }

  // Check for space
  if (integerPart.includes(' ')) {
    return ' ';
  }

  // Default: no separator
  return '';
}

/**
 * Detect decimal separator from number pattern
 */
function detectDecimalSeparator(numberPart: string): string {
  const hasDot = numberPart.includes('.');
  const hasComma = numberPart.includes(',');

  if (hasDot && hasComma) {
    // Determine which is decimal by position
    const lastDot = numberPart.lastIndexOf('.');
    const lastComma = numberPart.lastIndexOf(',');

    // The one closer to the end is likely decimal
    return lastComma > lastDot ? ',' : '.';
  }

  if (hasComma) {
    return ',';
  }

  if (hasDot) {
    return '.';
  }

  // Default
  return '.';
}

/**
 * Format number according to template pattern
 */
export function formatWithTemplate(
  value: number,
  pattern: TemplatePattern,
  symbol: string,
  precision?: number
): string {
  // Format number parts
  const parts = formatNumberParts(value, pattern, precision);

  // Build formatted string according to template structure
  // Replace symbol placeholder first
  let formatted = pattern.structure.replace(/\{Symbol\}/gi, symbol);

  // Find and replace number pattern while preserving spaces
  // Extract number pattern from template (everything except {Symbol} and spaces)
  // Match the entire number pattern including all digits and separators
  const numberPatternRegex = /[\d.,]+/g;
  const numberMatches = formatted.match(numberPatternRegex);
  
  if (numberMatches && numberMatches.length > 0) {
    // Replace the first (and usually only) number pattern match with formatted number
    // Use a more specific replacement to avoid replacing multiple times
    const firstMatch = numberMatches[0];
    formatted = formatted.replace(firstMatch, parts.formattedNumber);
  }

  return formatted.trim();
}

/**
 * Format number parts according to pattern
 */
function formatNumberParts(value: number, pattern: TemplatePattern, precision?: number): {
  formattedNumber: string;
  integerPart: string;
  decimalPart: string;
} {
  // Handle negative values
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  // Convert to string and split
  const valueStr = absValue.toString();
  const [integerStr, decimalStr = ''] = valueStr.split('.');

  // Format integer part with thousands separator
  let formattedInteger = integerStr;
  if (pattern.thousandsSeparator && integerStr.length > 3) {
    // Add thousands separators from right to left
    const reversed = integerStr.split('').reverse();
    const grouped: string[] = [];
    
    for (let i = 0; i < reversed.length; i += 3) {
      grouped.push(reversed.slice(i, i + 3).reverse().join(''));
    }
    
    formattedInteger = grouped.reverse().join(pattern.thousandsSeparator);
  }

  // Format decimal part
  const decimalDigits = precision ?? pattern.numberPattern.decimalDigits ?? 2;
  const formattedDecimal = (decimalStr || '00').padEnd(decimalDigits, '0').substring(0, decimalDigits);
  const decimalWithSeparator = formattedDecimal
    ? `${pattern.decimalSeparator}${formattedDecimal}`
    : '';

  // Combine
  const formattedNumber = `${isNegative ? '-' : ''}${formattedInteger}${decimalWithSeparator}`;

  return {
    formattedNumber,
    integerPart: formattedInteger,
    decimalPart: formattedDecimal,
  };

}
