export interface TemplatePattern {
  readonly symbolPosition: 'prefix' | 'suffix';
  readonly symbolPlaceholder: string;
  readonly customSymbol?: string;
  readonly thousandsSeparator: string;
  readonly decimalSeparator: string;
  readonly spaces: readonly number[];
  readonly structure: string;
  readonly numberPattern: {
    readonly integerDigits: number;
    readonly decimalDigits: number;
    readonly hasGrouping: boolean;
  };
}

export function parseTemplate(template: string): TemplatePattern {
  const symbolMatch = template.match(/\{Symbol(?::([^}]+))?\}/i);
  const customSymbol = symbolMatch?.[1];
  const symbolPlaceholder = symbolMatch?.[0] ?? '{Symbol}';

  const numberPart = symbolMatch
    ? template.replace(symbolMatch[0], '').trim()
    : template.trim();

  const symbolIndex = symbolMatch?.index ?? template.indexOf('{Symbol}');
  const symbolPosition: 'prefix' | 'suffix' =
    symbolIndex >= 0 && symbolIndex < template.length / 2 ? 'prefix' : 'suffix';

  const decimalSeparator = detectDecimalSeparator(numberPart);
  const thousandsSeparator = detectThousandsSeparator(
    numberPart,
    decimalSeparator
  );

  const spaces = [...template.matchAll(/ /g)].map((m) => m.index!);

  const numberPattern = analyzeNumberPattern(
    numberPart,
    thousandsSeparator,
    decimalSeparator
  );

  return {
    symbolPosition,
    symbolPlaceholder,
    customSymbol,
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
  const symbolToUse = pattern.customSymbol || symbol;
  
  let formatted = replaceSymbolPlaceholder(pattern, symbolToUse);
  formatted = replaceNumberPattern(formatted, parts.formattedNumber);
  
  return formatted.trim();
}

function replaceSymbolPlaceholder(pattern: TemplatePattern, symbol: string): string {
  let result = pattern.structure;
  
  if (pattern.customSymbol) {
    result = result.replace(/\{Symbol:[^}]+\}/gi, symbol);
  } else if (result.includes('{Symbol}')) {
    result = result.replace(/\{Symbol\}/gi, symbol);
  } else {
    // If no placeholder, append symbol based on position
    result = pattern.symbolPosition === 'suffix'
      ? `${result} ${symbol}`
      : `${symbol} ${result}`;
  }
  
  return result;
}

function replaceNumberPattern(formatted: string, formattedNumber: string): string {
  const numberMatch = formatted.match(/[\d.,]+/);
  return numberMatch ? formatted.replace(numberMatch[0], formattedNumber) : formatted;
}

export function formatNumberParts(value: number, pattern: TemplatePattern, precision?: number): {
  formattedNumber: string;
  integerPart: string;
  decimalPart: string;
} {
  const absValue = Math.abs(value);
  const [integerStr, decimalStr = ''] = absValue.toString().split('.');

  const formattedInteger = formatIntegerPart(integerStr, pattern.thousandsSeparator);
  const decimalDigits = precision ?? pattern.numberPattern.decimalDigits ?? 2;
  const formattedDecimal = formatDecimalPart(decimalStr, decimalDigits);
  
  const decimalWithSeparator = formattedDecimal
    ? `${pattern.decimalSeparator}${formattedDecimal}`
    : '';

  const sign = value < 0 ? '-' : '';
  const formattedNumber = `${sign}${formattedInteger}${decimalWithSeparator}`;

  return {
    formattedNumber,
    integerPart: formattedInteger,
    decimalPart: formattedDecimal,
  };
}

function formatIntegerPart(integerStr: string, separator: string): string {
  if (!separator || integerStr.length <= 3) {
    return integerStr;
  }
  
  const reversed = integerStr.split('').reverse();
  const grouped: string[] = [];
  
  for (let i = 0; i < reversed.length; i += 3) {
    grouped.push(reversed.slice(i, i + 3).reverse().join(''));
  }
  
  return grouped.reverse().join(separator);
}

function formatDecimalPart(decimalStr: string, digits: number): string {
  return (decimalStr || '00').padEnd(digits, '0').substring(0, digits);
}
