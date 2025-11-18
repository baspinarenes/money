# 💰 @enesbaspinar/money


[![npm version](https://img.shields.io/npm/v/@enesbaspinar/money.svg)](https://www.npmjs.com/package/@enesbaspinar/money)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@enesbaspinar/money)](https://bundlephobia.com/package/@enesbaspinar/money)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A developer-friendly, precise, and flexible money library that handles monetary calculations and formatting with **zero configuration**. Also supports customization with templates.

## ✨ Features

- 🎯 **Zero-Config**: Works out of the box, uses browser locale automatically
- 🔢 **Precise Math**: Uses `big.js` to avoid floating-point errors
- 🌍 **International**: Full Intl API support for all locales
- 🎨 **Custom Templates**: Define custom formatting templates per locale
- 🔗 **Chainable**: Fluent API for easy chaining
- 📦 **Small**: <10KB gzipped bundle size
- 💪 **TypeScript**: Full type safety

## 📦 Installation

```bash
npm install @enesbaspinar/money
# or
yarn add @enesbaspinar/money
# or
pnpm add @enesbaspinar/money
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { money } from '@enesbaspinar/money';

// Zero-config formatting (uses browser locale)
money(100).format()  // "$100.00" (or equivalent in your locale)

// Math operations
money(100)
  .add(50)           // 150
  .multiply(2)       // 300
  .discount(10)      // 270 (10% discount)
  .format()          // "$270.00"
```

### With Locale and Currency

```typescript
import { money } from '@enesbaspinar/money';

// Specify locale (currency auto-detected from locale)
money(1000.50).format({
  locale: 'en-US',
})  // "$1,000.50"

// European format
money(1000.50).format({
  locale: 'de-DE',
})  // "1.000,50 €"

// Turkish format
money(1000.50).format({
  locale: 'tr-TR',
})  // "1.000,50 ₺"

// Override currency while keeping locale formatting
money(1000.50).format({
  locale: 'tr-TR',      // Turkish number formatting (1.000,50)
  currency: 'USD'        // But use USD symbol ($)
})  // "$1.000,50" - Turkish format with USD currency
```

## 📚 API Reference

### Factory Function

#### `money(value: number | string | Money): Money`

Creates a new Money instance.

```typescript
money(100)
money("100.50")
money(money(100))  // Clone
```

### Money Operations

All operations return new Money instances (immutable).

#### `add(other: MoneyInput): Money`

Add another money value.

```typescript
money(100).add(50)  // Money(150)
money(100).add("50.25")  // Money(150.25)
money(100).add(money(25))  // Money(125)
```

#### `subtract(other: MoneyInput): Money`

Subtract another money value.

```typescript
money(100).subtract(50)  // Money(50)
money(100).subtract("25.75")  // Money(74.25)
```

#### `multiply(factor: number | string): Money`

Multiply by a factor.

```typescript
money(100).multiply(2)  // Money(200)
money(100).multiply(1.5)  // Money(150)
money(100).multiply("2.5")  // Money(250)
```

#### `divide(divisor: number | string): Money`

Divide by a divisor. Throws error if divisor is zero.

```typescript
money(100).divide(2)  // Money(50)
money(100).divide("2.5")  // Money(40)
money(100).divide(0)  // Error: Division by zero
```

#### `round(precision?: number, roundingStrategy?: RoundStrategy): Money`

Round to specified precision.

```typescript
money(100.456).round(2)  // Money(100.46)
money(100.456).round(2, RoundStrategy.DOWN)  // Money(100.45)
money(100.456).round(2, RoundStrategy.UP)  // Money(100.46)
money(100.456).round(0)  // Money(100)
```

#### `discount(percentage: number | string): Money`

Apply percentage discount.

```typescript
money(100).discount(10)  // Money(90) - 10% discount
money(100).discount("15.5")  // Money(84.5) - 15.5% discount
```

#### `equal(other: MoneyInput): boolean`

Check if equal to another money value.

```typescript
money(100).equal(100)  // true
money(100).equal(50)   // false
money(100).equal("100.00")  // true
```

#### `compare(other: MoneyInput): ComparisonResult`

Compare with another money value.

```typescript
money(100).compare(50)   // ComparisonResult.GREATER_THAN (1)
money(100).compare(100)  // ComparisonResult.EQUAL (0)
money(50).compare(100)   // ComparisonResult.LESS_THAN (-1)
```

#### `isZero(): boolean`

Check if value is zero.

```typescript
money(0).isZero()  // true
money(100).isZero()  // false
money(0.0001).isZero()  // false
```

#### `isPositive(): boolean`

Check if value is positive.

```typescript
money(100).isPositive()  // true
money(-100).isPositive()  // false
money(0).isPositive()  // false
```

#### `isNegative(): boolean`

Check if value is negative.

```typescript
money(-100).isNegative()  // true
money(100).isNegative()   // false
money(0).isNegative()     // false
```

#### `abs(): Money`

Get absolute value.

```typescript
money(-100).abs()  // Money(100)
money(100).abs()   // Money(100)
```

#### `negate(): Money`

Negate the value.

```typescript
money(100).negate()  // Money(-100)
money(-100).negate()  // Money(100)
```

### Conversion Methods

#### `toNumber(): number`

Convert to JavaScript number.

```typescript
money(100.50).toNumber()  // 100.5
```

#### `toString(): string`

Convert to string representation.

```typescript
money(100.50).toString()  // "100.5"
```

#### `toJSON(): string`

Convert to JSON string (same as toString).

```typescript
money(100.50).toJSON()  // "100.5"
```

### Formatting

#### `format(options?: FormatOptions): string`

Format to string with locale and currency support.

```typescript
money(1000.50).format()  // Uses browser locale
money(1000.50).format({
  locale: 'en-US',
  precision: 2,
})  // "$1,000.50"

money(1000.50).format({
  locale: 'de-DE',
  precision: 2,
})  // "1.000,50 €"
```

#### `formatToParts(options?: FormatOptions): FormatPart[]`

Format to parts array for custom rendering.

```typescript
money(1000.50).formatToParts({
  locale: 'en-US'
})
// [
//   { type: 'currency', value: '$' },
//   { type: 'integer', value: '1' },
//   { type: 'group', value: ',' },
//   { type: 'integer', value: '000' },
//   { type: 'decimal', value: '.' },
//   { type: 'fraction', value: '50' }
// ]
```

#### `formatToComponents(options?: FormatOptions): FormatComponents`

Format to structured components object for easy access to formatting parts.

```typescript
money(1000.50).formatToComponents({
  locale: 'en-US',
  currency: 'USD'
})
// {
//   currency: "$",
//   groupDelimiter: ",",
//   decimalDelimiter: ".",
//   formatted: "1,000.50",
//   formattedWithSymbol: "$1,000.50"
// }

// German format
money(1000.50).formatToComponents({
  locale: 'de-DE',
  currency: 'EUR'
})
// {
//   currency: "€",
//   groupDelimiter: ".",
//   decimalDelimiter: ",",
//   formatted: "1.000,50",
//   formattedWithSymbol: "1.000,50 €"
// }

// Turkish format
money(1000.50).formatToComponents({
  locale: 'tr-TR',
  currency: 'TRY'
})
// {
//   currency: "₺",
//   groupDelimiter: ".",
//   decimalDelimiter: ",",
//   formatted: "1.000,50",
//   formattedWithSymbol: "₺1.000,50"
// }
```

### Static Methods

#### `Money.parse(value: string, options?: ParseOptions): Money`

Parse a formatted string back to Money instance.

```typescript
Money.parse("$1,000.50", { locale: 'en-US' })  // Money(1000.50)
Money.parse("1.000,50 €", { locale: 'de-DE' })  // Money(1000.50)
Money.parse("1.234,56 ₺", { locale: 'tr-TR', currency: 'TRY' })  // Money(1234.56)
```

### Format Options

```typescript
export interface FormatOptions {
  locale?: string;                    // Locale string (e.g., 'en-US', 'tr-TR')
  currency?: string;                   // Currency code (e.g., 'USD', 'EUR', 'TRY')
  templates?: Record<string, string>; // Custom templates per locale
  trimDoubleZeros?: boolean | Record<string, boolean>;  // Trim .00 endings
  trimPaddingZeros?: boolean | Record<string, boolean>; // Trim leading zeros
  precision?: number;                  // Decimal precision
  roundingStrategy?: RoundStrategy;    // Rounding strategy
  preventGrouping?: boolean;           // Disable thousands separator
}
```

### Format Components

```typescript
export interface FormatComponents {
  currency: string;           // Currency symbol (e.g., '$', '€', '₺')
  groupDelimiter: string;    // Thousands separator (e.g., ',', '.', ' ')
  decimalDelimiter: string;  // Decimal separator (e.g., '.', ',')
  formatted: string;         // Formatted number without currency symbol
  formattedWithSymbol: string; // Complete formatted string with currency symbol
}
```

### Rounding Strategies

```typescript
enum RoundStrategy {
  NEAREST,  // Round to nearest (default)
  UP,       // Always round up
  DOWN,     // Always round down
}
```

## 🎨 Custom Templates

Templates allow you to define custom formatting patterns for different locales. The template system uses `{Symbol}` as a placeholder for the currency symbol and detects separators from your pattern.

### Template Syntax

- `{Symbol}` - Placeholder for currency symbol (auto-detected position)
- Number pattern - Defines decimal and thousands separators
- Spaces - Preserved in output

### Template Priority

Templates are matched in this order:
1. Full locale (e.g., `"en-US"`)
2. Country code (e.g., `"US"`)
3. Language code (e.g., `"en"`)
4. `"default"` fallback

### Template Examples

#### Basic Template Usage

```typescript
import { money } from '@enesbaspinar/money';

// Define templates for different locales
const amount = money(5000.99);

// US-style template
amount.format({
  locale: 'en-US',
  templates: {
    'en-US': '{Symbol} 1,000.00',  // Symbol prefix, comma thousands, dot decimal
  }
})  // "$ 5,000.99"

// European-style template
amount.format({
  locale: 'de-DE',
  templates: {
    'de-DE': '{Symbol} 1.000,00',  // Symbol prefix, dot thousands, comma decimal
  }
})  // "€ 5.000,99"

// Turkish-style template
amount.format({
  locale: 'tr-TR',
  templates: {
    'tr-TR': '{Symbol} 1.000,00',  // Symbol prefix, dot thousands, comma decimal
  }
})  // "₺ 5.000,99"
```

#### Locale-Based Templates with Currency Override

```typescript
import { money } from '@enesbaspinar/money';

const amount = money(1234.56);

// Use Turkish locale formatting but override currency to USD
amount.format({
  locale: 'tr-TR',           // Turkish number format (1.234,56)
  currency: 'USD',           // But use USD symbol
  templates: {
    'tr-TR': '{Symbol} 1.000,00',  // Turkish template pattern
  }
})  // "$ 1.234,56" - Turkish format with USD currency

// Use German locale formatting but override currency to TRY
amount.format({
  locale: 'de-DE',           // German number format
  currency: 'TRY',           // But use Turkish Lira symbol
  templates: {
    'de-DE': '{Symbol} 1.000,00',
  }
})  // "₺ 1.234,56" - German format with TRY currency
```

#### Multiple Locale Templates

```typescript
import { money } from '@enesbaspinar/money';

const amount = money(1000.50);

// Define templates for multiple locales
amount.format({
  locale: 'en-US',
  templates: {
    'en-US': '{Symbol} 1,000.00',      // US: $ 1,000.50
    'de-DE': '{Symbol} 1.000,00',      // German: € 1.000,50
    'tr-TR': '{Symbol} 1.000,00',      // Turkish: ₺ 1.000,50
    'fr-FR': '{Symbol} 1 000,00',      // French: € 1 000,50 (space separator)
    'default': '{Symbol} 1,000.00',    // Fallback template
  }
})  // "$ 1,000.50"

// Switch locale - automatically uses matching template
amount.format({
  locale: 'tr-TR',
  templates: {
    'en-US': '{Symbol} 1,000.00',
    'tr-TR': '{Symbol} 1.000,00',
  }
})  // "₺ 1.000,50"
```

#### Template with Symbol Suffix

```typescript
import { money } from '@enesbaspinar/money';

const amount = money(1000.50);

// Symbol after the number
amount.format({
  locale: 'en-US',
  templates: {
    'en-US': '1,000.00 {Symbol}',  // Symbol suffix
  }
})  // "1,000.50 $"
```

#### Template Precision

Templates automatically detect decimal precision from the pattern:

```typescript
import { money } from '@enesbaspinar/money';

const amount = money(1000.999);

// Template with 2 decimal places
amount.format({
  locale: 'en-US',
  templates: {
    'en-US': '{Symbol} 1,000.00',  // 2 decimals detected
  }
})  // "$ 1,001.00" (rounded)

// Template with 0 decimal places
amount.format({
  locale: 'en-US',
  templates: {
    'en-US': '{Symbol} 1,000',  // No decimals
  }
})  // "$ 1,001" (rounded)
```

#### Advanced Template Example

```typescript
import { money } from '@enesbaspinar/money';

// Complex e-commerce scenario with multiple locales and currencies
const price = money(1234.567);

// Define comprehensive template set
const templates = {
  'en-US': '{Symbol} 1,000.00',      // US: $ 1,234.57
  'en-GB': '{Symbol} 1,000.00',      // UK: £ 1,234.57
  'de-DE': '{Symbol} 1.000,00',      // Germany: € 1.234,57
  'fr-FR': '{Symbol} 1 000,00',      // France: € 1 234,57
  'tr-TR': '{Symbol} 1.000,00',      // Turkey: ₺ 1.234,57
  'ja-JP': '{Symbol} 1,000',         // Japan: ¥ 1,235 (no decimals)
  'default': '{Symbol} 1,000.00',    // Fallback
};

// Format for US market
price.format({
  locale: 'en-US',
  templates,
})  // "$ 1,234.57"

// Format for Turkish market with USD currency
price.format({
  locale: 'tr-TR',
  currency: 'USD',  // Override currency
  templates,
})  // "$ 1.234,57" - Turkish format, USD currency

// Format for German market with TRY currency
price.format({
  locale: 'de-DE',
  currency: 'TRY',  // Override currency
  templates,
})  // "₺ 1.234,57" - German format, TRY currency
```

## 💡 Examples

### E-commerce Shopping Cart

```typescript
import { money } from '@enesbaspinar/money';

const itemPrice = money(29.99);
const quantity = 3;
const taxRate = 0.08;  // 8%
const discountPercent = 10;

const subtotal = itemPrice.multiply(quantity);
const discount = subtotal.discount(discountPercent);
const tax = discount.multiply(taxRate);
const total = discount.add(tax);

console.log({
  subtotal: subtotal.format({ locale: 'en-US' }),
  discount: discount.format({ locale: 'en-US' }),
  tax: tax.format({ locale: 'en-US' }),
  total: total.format({ locale: 'en-US' }),
});
```

### Price Comparison

```typescript
import { money, ComparisonResult } from '@enesbaspinar/money';

const price1 = money(100);
const price2 = money(150);

const comparison = price1.compare(price2);
if (comparison === ComparisonResult.LESS_THAN) {
  console.log('Price 1 is cheaper');
} else if (comparison === ComparisonResult.GREATER_THAN) {
  console.log('Price 1 is more expensive');
} else {
  console.log('Prices are equal');
}
```

### International Formatting

```typescript
import { money } from '@enesbaspinar/money';

const amount = money(1234.56);

// US format
amount.format({ locale: 'en-US' })  // "$1,234.56"

// European format
amount.format({ locale: 'de-DE' })  // "1.234,56 €"

// Turkish format
amount.format({ locale: 'tr-TR' })   // "1.234,56 ₺"

// Japanese format (no decimals)
amount.format({ locale: 'ja-JP' })   // "¥1,235"

// Override currency while keeping locale format
amount.format({
  locale: 'tr-TR',    // Turkish number format
  currency: 'USD'      // But use USD symbol
})  // "$1.234,56" - Turkish format with USD
```

### Zero Trimming

```typescript
import { money } from '@enesbaspinar/money';

// Trim double zeros
money(100).format({
  locale: 'en-US',
  trimDoubleZeros: true,
})  // "$100" instead of "$100.00"

// Trim padding zeros
money(100).format({
  locale: 'en-US',
  trimPaddingZeros: true,
})  // Removes leading zeros
```

### Precision Control

```typescript
import { money, RoundStrategy } from '@enesbaspinar/money';

const amount = money(100.456);

// Round to 2 decimals
amount.round(2).format({ locale: 'en-US' })  // "$100.46"

// Round down
amount.round(2, RoundStrategy.DOWN).format({ locale: 'en-US' })  // "$100.45"

// Round up
amount.round(2, RoundStrategy.UP).format({ locale: 'en-US' })  // "$100.46"

// Format with precision
amount.format({
  locale: 'en-US',
  precision: 2,
  roundingStrategy: RoundStrategy.DOWN,
})  // "$100.45"
```

### Parsing Formatted Strings

```typescript
import { Money } from '@enesbaspinar/money';

// Parse US format
const usAmount = Money.parse("$1,234.56", { locale: 'en-US' });
usAmount.toNumber()  // 1234.56

// Parse European format
const euAmount = Money.parse("1.234,56 €", { locale: 'de-DE' });
euAmount.toNumber()  // 1234.56

// Parse Turkish format
const trAmount = Money.parse("1.234,56 ₺", { locale: 'tr-TR', currency: 'TRY' });
trAmount.toNumber()  // 1234.56
```

### Chainable Operations

```typescript
import { money } from '@enesbaspinar/money';

const result = money(100)
  .add(50)           // 150
  .multiply(2)       // 300
  .discount(10)      // 270
  .round(2)          // 270.00
  .format({ locale: 'en-US' });  // "$270.00"

console.log(result);  // "$270.00"
```

### Conditional Formatting

```typescript
import { money } from '@enesbaspinar/money';

function formatPrice(amount: number, userLocale: string, userCurrency?: string) {
  return money(amount).format({
    locale: userLocale,
    currency: userCurrency,  // Optional override
    templates: {
      [userLocale]: '{Symbol} 1,000.00',
      'default': '{Symbol} 1,000.00',
    },
  });
}

// User in Turkey, but prefers USD
formatPrice(1000, 'tr-TR', 'USD')  // "$ 1.000,00"

// User in Germany, default EUR
formatPrice(1000, 'de-DE')  // "€ 1.000,00"
```

### Format Components Usage

```typescript
import { money } from '@enesbaspinar/money';

const price = money(1234.56);
const components = price.formatToComponents({
  locale: 'en-US'
});

// Access individual parts
console.log(components.currency);        // "$"
console.log(components.groupDelimiter); // ","
console.log(components.decimalDelimiter); // "."
console.log(components.formatted);      // "1,234.56"
console.log(components.formattedWithSymbol); // "$1,234.56"

// Use in React/Vue components
function PriceDisplay({ amount }: { amount: number }) {
  const comp = money(amount).formatToComponents({ locale: 'en-US', currency: 'USD' });
  
  return (
    <div className="price">
      <span className="currency">{comp.currency}</span>
      <span className="amount">{comp.formatted}</span>
    </div>
  );
}

// Currency override example
const turkishPrice = money(1000.50);
const componentsTR = turkishPrice.formatToComponents({
  locale: 'tr-TR',
  currency: 'USD'  // Override currency
});

console.log(componentsTR.formattedWithSymbol); // "$1.000,50" - Turkish format, USD currency
```

## 📊 Performance

- **Bundle Size**: <10KB gzipped
- **Operations**: <1ms per operation
- **Memory**: Efficient immutable design

## 🌐 Browser Support

Modern browsers with ES2020+ support:
- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.
