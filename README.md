# 💰 @enesbaspinar/money

> A comprehensive library for precise monetary calculations and customizable locale-based currency formatting

[![npm version](https://img.shields.io/npm/v/@enesbaspinar/money.svg)](https://www.npmjs.com/package/@enesbaspinar/money)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@enesbaspinar/money)](https://bundlephobia.com/package/@enesbaspinar/money)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A developer-friendly, precise, and flexible money library that handles monetary calculations and formatting with **zero configuration**.

## ✨ Features

- 🎯 **Zero-Config**: Works out of the box, uses browser locale automatically
- 🔢 **Precise Math**: Uses `big.js` to avoid floating-point errors
- 🌍 **International**: Full Intl API support for all locales
- 🔗 **Chainable**: Fluent API for easy chaining
- 🛡️ **Immutable**: All operations return new instances
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

### With Options

```typescript
import { money } from '@enesbaspinar/money';

// Specify locale and currency
money(1000.50).format({
  locale: 'en-US',
})  // "$1,000.50"

// European format
money(1000.50).format({
  locale: 'de-DE',
})  // "1.000,50 €"

// Turkish format
money(1000.50).format({
  locale: 'az-AZ',
  currency: 'TRY'
})  // "1.000,50 ₺"
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
```

#### `subtract(other: MoneyInput): Money`

Subtract another money value.

```typescript
money(100).subtract(50)  // Money(50)
```

#### `multiply(factor: number | string): Money`

Multiply by a factor.

```typescript
money(100).multiply(2)  // Money(200)
money(100).multiply(1.5)  // Money(150)
```

#### `divide(divisor: number | string): Money`

Divide by a divisor. Throws error if divisor is zero.

```typescript
money(100).divide(2)  // Money(50)
money(100).divide(0)  // Error: Division by zero
```

#### `round(precision?: PrecisionConfig): Money`

Round to specified precision.

```typescript
money(100.456).round({ digit: 2 })  // Money(100.46)
money(100.456).round({
  digit: 2,
  strategy: RoundStrategy.DOWN
})  // Money(100.45)
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
```

#### `compare(other: MoneyInput): ComparisonResult`

Compare with another money value.

```typescript
money(100).compare(50)   // ComparisonResult.GREATER_THAN
money(100).compare(100)  // ComparisonResult.EQUAL
money(50).compare(100)    // ComparisonResult.LESS_THAN
```

#### `isZero(): boolean`

Check if value is zero.

```typescript
money(0).isZero()  // true
money(100).isZero()  // false
```

#### `isPositive(): boolean`

Check if value is positive.

```typescript
money(100).isPositive()  // true
money(-100).isPositive()  // false
```

#### `isNegative(): boolean`

Check if value is negative.

```typescript
money(-100).isNegative()  // true
money(100).isNegative()   // false
```

#### `abs(): Money`

Get absolute value.

```typescript
money(-100).abs()  // Money(100)
```

#### `negate(): Money`

Negate the value.

```typescript
money(100).negate()  // Money(-100)
```

### Formatting

#### `format(options?: FormatOptions): string`

Format to string.

```typescript
money(1000.50).format()  // Uses browser locale
money(1000.50).format({
  locale: 'en-US',
  precision: 2,
})  // "$1,000.50"
```

#### `formatToParts(options?: FormatOptions): FormatPart[]`

Format to parts array.

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

### Format Options

```typescript
export interface FormatOptions {
  locale?: string;
  currency?: string;
  templates?: Record<string, string>;
  trimDoubleZeros?: boolean | Record<string, boolean>;
  trimPaddingZeros?: boolean | Record<string, boolean>;
  precision?: number;
  roundingStrategy?: RoundStrategy;
  preventGrouping?: boolean;
}
```

### Rounding Strategies

```typescript
enum RoundStrategy {
  NEAREST,
  UP,
  DOWN,
}
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
amount.format({ locale: 'de-DE', })  // "1.234,56 €"

// Turkish format
amount.format({ locale: 'tr-TR' })   // "1.234,56 ₺"

// Japanese format
amount.format({ locale: 'ja-JP' })   // "¥1,235"
```

## 🏗️ Architecture

This library follows several design patterns:

- **Value Object Pattern**: Money instances are immutable value objects
- **Factory Pattern**: `money()` factory function for easy creation
- **Strategy Pattern**: Different rounding strategies
- **Adapter Pattern**: Intl API integration
- **Builder Pattern**: Chainable operations

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

