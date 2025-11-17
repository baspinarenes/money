export interface TemplatePattern {
  symbolPosition: 'prefix' | 'suffix';
  symbolPlaceholder: string;
  thousandsSeparator: string;
  decimalSeparator: string;
  spaces: number[];
  structure: string;
  numberPattern: {
    integerDigits: number;
    decimalDigits: number;
    hasGrouping: boolean;
  };
}

export function parseTemplate(template: string): TemplatePattern {
  const symbolMatch = template.match(/\{Symbol\}/i);
  const symbolIndex = symbolMatch ? symbolMatch.index! : -1;
  const symbolPosition: 'prefix' | 'suffix' = symbolIndex < template.length / 2 ? 'prefix' : 'suffix';

  const numberPart = template.replace(/\{Symbol\}/gi, '').trim();

  const decimalSeparator = detectDecimalSeparator(numberPart);
  const thousandsSeparator = detectThousandsSeparator(numberPart, decimalSeparator);

  const spaces: number[] = [];
  let searchIndex = 0;
  let spaceIndex = template.indexOf(' ', searchIndex);
  while (spaceIndex !== -1) {
    spaces.push(spaceIndex);
    searchIndex = spaceIndex + 1;
    spaceIndex = template.indexOf(' ', searchIndex);
  }

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

function analyzeNumberPattern(
  numberPart: string,
  thousandsSeparator: string,
  decimalSeparator: string
): { integerDigits: number; decimalDigits: number; hasGrouping: boolean } {
  const parts = numberPart.split(decimalSeparator);
  const integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';

  const integerDigits = integerPart.replace(/[^\d]/g, '').length;
  const decimalDigits = decimalPart.replace(/[^\d]/g, '').length;
  const hasGrouping = thousandsSeparator !== '' && integerPart.includes(thousandsSeparator);

  return {
    integerDigits,
    decimalDigits,
    hasGrouping,
  };
}

function detectThousandsSeparator(numberPart: string, decimalSeparator: string): string {
  const integerPart = decimalSeparator 
    ? numberPart.split(decimalSeparator)[0] || numberPart
    : numberPart;

  const dotCount = (integerPart.match(/\./g) || []).length;
  const commaCount = (integerPart.match(/,/g) || []).length;

  if (decimalSeparator === ',' && dotCount > 0) return '.';
  if (decimalSeparator === '.' && commaCount > 0) return ',';
  if (dotCount > 0 && commaCount > 0) return decimalSeparator === ',' ? '.' : ',';
  if (integerPart.includes('.') && decimalSeparator !== '.') return '.';
  if (integerPart.includes(',') && decimalSeparator !== ',') return ',';
  if (integerPart.includes(' ')) return ' ';

  return '';
}

function detectDecimalSeparator(numberPart: string): string {
  const hasDot = numberPart.includes('.');
  const hasComma = numberPart.includes(',');

  if (hasDot && hasComma) {
    const lastDot = numberPart.lastIndexOf('.');
    const lastComma = numberPart.lastIndexOf(',');

    return lastComma > lastDot ? ',' : '.';
  }

  if (hasComma) return ',';
  if (hasDot) return '.';

  return '.';
}

export function formatWithTemplate(
  value: number,
  pattern: TemplatePattern,
  symbol: string,
  precision?: number
): string {
  const parts = formatNumberParts(value, pattern, precision);

  let formatted = pattern.structure.replace(/\{Symbol\}/gi, symbol);

  const numberPatternRegex = /[\d.,]+/g;
  const numberMatches = formatted.match(numberPatternRegex);
  
  if (numberMatches && numberMatches.length > 0) {
    const firstMatch = numberMatches[0];
    formatted = formatted.replace(firstMatch, parts.formattedNumber);
  }

  return formatted.trim();
}

function formatNumberParts(value: number, pattern: TemplatePattern, precision?: number): {
  formattedNumber: string;
  integerPart: string;
  decimalPart: string;
} {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  const valueStr = absValue.toString();
  const [integerStr, decimalStr = ''] = valueStr.split('.');

  let formattedInteger = integerStr;
  if (pattern.thousandsSeparator && integerStr.length > 3) {
    const reversed = integerStr.split('').reverse();
    const grouped: string[] = [];
    
    for (let i = 0; i < reversed.length; i += 3) {
      grouped.push(reversed.slice(i, i + 3).reverse().join(''));
    }
    
    formattedInteger = grouped.reverse().join(pattern.thousandsSeparator);
  }

  const decimalDigits = precision ?? pattern.numberPattern.decimalDigits ?? 2;
  const formattedDecimal = (decimalStr || '00').padEnd(decimalDigits, '0').substring(0, decimalDigits);
  const decimalWithSeparator = formattedDecimal
    ? `${pattern.decimalSeparator}${formattedDecimal}`
    : '';

  const formattedNumber = `${isNegative ? '-' : ''}${formattedInteger}${decimalWithSeparator}`;

  return {
    formattedNumber,
    integerPart: formattedInteger,
    decimalPart: formattedDecimal,
  };
}
