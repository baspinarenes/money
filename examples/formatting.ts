import { money } from '../src/index';

console.log('=== Formatting Methods Examples ===\n');

const amount = money(1000.50);

// 1. format() - Basic formatting
console.log('1. format() - Basic formatting:');
console.log(`US Format: ${amount.format({ locale: 'en-US', currency: 'USD' })}`);
console.log(`German Format: ${amount.format({ locale: 'de-DE', currency: 'EUR' })}`);
console.log(`Turkish Format: ${amount.format({ locale: 'tr-TR', currency: 'TRY' })}`);
console.log(`Japanese Format: ${amount.format({ locale: 'ja-JP', currency: 'JPY' })}`);
console.log();

// 2. format() - With precision
console.log('2. format() - With precision:');
const preciseAmount = money(100.456);
console.log(`Original: ${preciseAmount.toString()}`);
console.log(`Precision 0: ${preciseAmount.format({ locale: 'en-US', precision: 0 })}`);
console.log(`Precision 1: ${preciseAmount.format({ locale: 'en-US', precision: 1 })}`);
console.log(`Precision 2: ${preciseAmount.format({ locale: 'en-US', precision: 2 })}`);
console.log(`Precision 3: ${preciseAmount.format({ locale: 'en-US', precision: 3 })}`);
console.log();

// 3. format() - Zero trimming
console.log('3. format() - Zero trimming:');
const wholeAmount = money(100);
console.log(`Without trimming: ${wholeAmount.format({ locale: 'en-US', currency: 'USD' })}`);
console.log(`With trimDoubleZeros: ${wholeAmount.format({ locale: 'en-US', currency: 'USD', trimDoubleZeros: true })}`);
console.log();

// 4. format() - Prevent grouping
console.log('4. format() - Prevent grouping:');
const largeAmount = money(1000000.50);
console.log(`With grouping: ${largeAmount.format({ locale: 'en-US', currency: 'USD' })}`);
console.log(`Without grouping: ${largeAmount.format({ locale: 'en-US', currency: 'USD', preventGrouping: true })}`);
console.log();

// 5. format() - Currency override
console.log('5. format() - Currency override:');
console.log(`Turkish locale, USD currency: ${amount.format({ locale: 'tr-TR', currency: 'USD' })}`);
console.log(`German locale, TRY currency: ${amount.format({ locale: 'de-DE', currency: 'TRY' })}`);
console.log();

// 6. formatToParts() - Get formatting parts
console.log('6. formatToParts() - Get formatting parts:');
const parts = amount.formatToParts({ locale: 'en-US', currency: 'USD' });
console.log('Parts array:');
parts.forEach((part, index) => {
  console.log(`  [${index}] type: "${part.type}", value: "${part.value}"`);
});
console.log();

// 7. formatToParts() - Custom rendering example
console.log('7. formatToParts() - Custom rendering example:');
const customParts = amount.formatToParts({ locale: 'en-US', currency: 'USD' });
const customFormatted = customParts
  .map((part) => {
    switch (part.type) {
      case 'currency':
        return `<span class="currency">${part.value}</span>`;
      case 'integer':
        return `<span class="integer">${part.value}</span>`;
      case 'group':
        return `<span class="group">${part.value}</span>`;
      case 'decimal':
        return `<span class="decimal">${part.value}</span>`;
      case 'fraction':
        return `<span class="fraction">${part.value}</span>`;
      default:
        return part.value;
    }
  })
  .join('');
console.log('Custom HTML rendering:');
console.log(customFormatted);
console.log();

// 8. formatToComponents() - Get structured components
console.log('8. formatToComponents() - Get structured components:');
const componentsUS = amount.formatToComponents({ locale: 'en-US', currency: 'USD' });
console.log('US Format Components:');
console.log(JSON.stringify(componentsUS, null, 2));
console.log();

const componentsDE = amount.formatToComponents({ locale: 'de-DE', currency: 'EUR' });
console.log('German Format Components:');
console.log(JSON.stringify(componentsDE, null, 2));
console.log();

const componentsTR = amount.formatToComponents({ locale: 'tr-TR', currency: 'TRY' });
console.log('Turkish Format Components:');
console.log(JSON.stringify(componentsTR, null, 2));
console.log();

// 9. formatToComponents() - Usage in UI components
console.log('9. formatToComponents() - Usage in UI components:');
const price = money(1234.56);
const priceComponents = price.formatToComponents({ locale: 'en-US', currency: 'USD' });

console.log('Price Display Example:');
console.log(`Currency Symbol: ${priceComponents.currency}`);
console.log(`Group Delimiter: "${priceComponents.groupDelimiter}"`);
console.log(`Decimal Delimiter: "${priceComponents.decimalDelimiter}"`);
console.log(`Formatted (no symbol): ${priceComponents.formatted}`);
console.log(`Formatted (with symbol): ${priceComponents.formattedWithSymbol}`);
console.log();

// 10. formatToComponents() - Different locales comparison
console.log('10. formatToComponents() - Different locales comparison:');
const testAmount = money(1234567.89);
const locales = [
  { locale: 'en-US', name: 'United States' },
  { locale: 'de-DE', name: 'Germany' },
  { locale: 'tr-TR', name: 'Turkey' },
  { locale: 'fr-FR', name: 'France' },
  { locale: 'ja-JP', name: 'Japan' },
];

locales.forEach(({ locale, name }) => {
  const comp = testAmount.formatToComponents({ locale });
  console.log(`${name} (${locale}):`);
  console.log(`  Currency: ${comp.currency}`);
  console.log(`  Group: "${comp.groupDelimiter}"`);
  console.log(`  Decimal: "${comp.decimalDelimiter}"`);
  console.log(`  Formatted: ${comp.formatted}`);
  console.log(`  With Symbol: ${comp.formattedWithSymbol}`);
  console.log();
});

// 11. formatToComponents() - Template usage
console.log('11. formatToComponents() - With templates:');
const templateAmount = money(5000.99);
const templateComponents = templateAmount.formatToComponents({
  locale: 'en-US',
  currency: 'USD',
  templates: {
    'en-US': '{Symbol} 1,000.00',
  },
});
console.log('Template Format Components:');
console.log(JSON.stringify(templateComponents, null, 2));
console.log();

// 12. formatToComponents() - Practical use case: Price display component
console.log('12. formatToComponents() - Practical use case: Price display component:');
function renderPrice(moneyInstance: ReturnType<typeof money>, locale: string, currency: string) {
  const comp = moneyInstance.formatToComponents({ locale, currency });
  
  return {
    display: comp.formattedWithSymbol,
    parts: {
      symbol: comp.currency,
      number: comp.formatted,
      groupSeparator: comp.groupDelimiter,
      decimalSeparator: comp.decimalDelimiter,
    },
    // For React/Vue component usage
    jsx: (
      `<div className="price">
        <span className="currency">${comp.currency}</span>
        <span className="amount">${comp.formatted}</span>
      </div>`
    ),
  };
}

const productPrice = money(99.99);
const priceDisplay = renderPrice(productPrice, 'en-US', 'USD');
console.log('Price Display Object:');
console.log(JSON.stringify(priceDisplay, null, 2));
console.log('JSX Example:');
console.log(priceDisplay.jsx);

