<h1>
 :moneybag: Money &nbsp;&nbsp;
 <div style="display: flex; gap: 10px;">
    <a href=""><img src="https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/baspinarenes/2f738df7e195409cacd5c94b0f07d8bb/raw/test.json" /></a>
    <a href="http://hits.dwyl.com/baspinarenes/money">
      <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fhits.dwyl.com%2Fbaspinarenes%2Fmonefy.svg%3Fshow%3Dunique%3Flabel%3DHits&logo=buzzfeed&logoColor=white">
    </a>
    <a href="http://hits.dwyl.com/baspinarenes/money"><img src="https://github.com/baspinarenes/money/actions/workflows/release.yml/badge.svg" /></a>
  </div>
</h1>

A comprehensive library for precise monetary calculations and customizable locale-based currency formatting.

## Installation

You can install via your favorite package manager:

```bash
npm install @enesbaspinar/money
yarn add @enesbaspinar/money
pnpm install @enesbaspinar/money
```

## Documentation
### Easy Start

You can configure the formatting behavior using the `createMoney` function.

```typescript
import { createMoney } from '@enesbaspinar/money';

const money = createMoney({
  locale: 'en-US'
});

// Uses global config
console.log(money(1234.567).format()); // 1.234,567 $

// Override global config for this specific call
console.log(money(1234.567).format({ 
  locale: 'de-DE',
  templates: {
    '*': '{currency} {integer|.}{fraction|,|2}'
  }
})); // € 1.234,56
```

The configuration object accepts all [formatting options](#formatting) listed below.

This package provides two classes. These are:

- `Money`: A utility class for performing arithmetic operations on monetary values.
- `MoneyFormatter`: A class for formatting monetary values with locale-specific currency formats.

### Money Class

The `Money` class provides an easy-to-use and chainable API for manipulating monetary values with accurate calculations.

`new Money(amount: number)`

Creates a instance with the specified amount.

```typescript
const money = new Money(1234.567);
```

`monetize(amount: number): Money`

A utility function to create a `Money` instance with the specified amount.

```typescript
const money = monetize(1234.567);
```

#### Properties

`value: number`, `amount: number`

Returns the full amount.

```typescript
const value = money.value; // 1234.567
```

`integer: number`

Returns the integer part of the monetary value (ignores any fractional value).

```typescript
const integerPart = money.integer; // 1234
```

`fraction: number`

Returns the fractional part of the monetary value as an integer. If there is no fraction, it returns 0.

```typescript
const fractionPart = money.fraction; // 567
```

#### Methods

`add(amount: number | Money): Money`

Adds the specified amount to current `Money` instance and returns `Money` instance.

```typescript
const newMoney = money.add(50); // 1284.567
```

`subtract(amount: number | Money): Money`

Subtracts the specified amount to current `Money` instance and returns `Money` instance.

```typescript
const newMoney = money.subtract(50); // 1184.567
```

`multiply(amount: number | Money): Money`

Multiplies the current `Money` instance by the specified amount and returns `Money` instance.

```typescript
const newMoney = money.multiply(2); // 2469,134
```

`divide(amount: number | Money): Money`

Divides the current `Money` instance by the specified amount and returns `Money` instance.

```typescript
const newMoney = money.divide(2); // 617,2835
```

`round(decimals: number, strategy?: RoundStrategy): Money`

Rounds the current `Money` instance to the specified number of decimal places using a specified rounding strategy. Default: `RoundStrategy.NEAREST`

```typescript
const roundedMoney = money.round(1, RoundStrategy.DOWN); // 1234,5
```

`discount(rate: number): Money`

Applies a discount to the current `Money` instance based on the given rate (expressed as a percentage) and returns `Money` instance. The rate could be in 0-1 or 0-100 ranges.

```typescript
const discountedMoney = money.discount(20); // 987.6536
```

`equal(amount: number | Money): boolean`

Compares the current `Money` instance to another amount or `Money` instance. Returns `true` if they are equal, otherwise `false`.

```typescript
const isEqual = money.equal(1234.567); // true
```

`format(options: MoneyFormatterOptions): string`

Formats the `Money` instance into a string representation according to the provided [formatting options](#formatting).

```typescript
const formattedMoney = money.format({ locale: "GB" }); // £1,234.567
```

`formatToParts(options: MoneyFormatterOptions): MoneyFormat`

Formats the `Money` instance into an object with separate parts, like integer and fractional values, according to the provided [formatting options](#formatting).

```typescript
const formattedMoneyParts = money.formatToParts({ locale: "GB" });

/*
result for example: {
  currency: '£',
  value: 1234.567,
  integer: '1,234',
  fraction: '.567',
  formatted: '1,234.567',
  display: '£1,234.567'
}
*/
```

`valueOf(): number`

Returns the amount of the `Money` instance.

```typescript
const rawValue = money.valueOf(); // 1234.567
```

`toString(): string`

Returns a string representation of the `Money` instance.

```typescript
const stringValue = money.toString(); // '1234.567'
```

### MoneyFormatter Class

The `MoneyFormatter` class is responsible for formatting monetary values according to specific locale-based templates. It takes into account local conventions such as currency symbols, decimal separators, and grouping separators.

#### Constructor

`new MoneyFormatter(options: MoneyFormatterOptions)`

Creates a new `MoneyFormatter` instance with the provided options.

```typescript
const formatter = new MoneyFormatter({ locale: "tr-TR" });
```

**Parameters:**

- `options` (MoneyFormatterOptions): Configuration options for [formatting](#formatting) the money value.

**Throws:**

- Throws an error if the `locale` option is invalid.

#### Static Method

`create(options: MoneyFormatterOptions): MoneyFormatter`

Creates and returns a new instance of `MoneyFormatter` with the given options.

```typescript
const formatter = MoneyFormatter.create({ locale: "en-US" });
```

#### Methods

`format(money: number | Money, formatOptions?: MoneyFormatterOptions): string`

Formats the `Money` instance (or a raw numeric value) into a string representation based on the provided [formatting options](#formatting).

```typescript
const formattedMoney = formatter.format(money); // $1,234.567
```

`formatToParts(money: number | Money, formatOptions?: MoneyFormatterOptions): MoneyFormat`

Formats the `Money` instance (or a raw numeric value) into an object with separate formatted parts, like integer, fraction, and currency symbol, based on the provided [formatting options](#formatting).

```typescript
const formattedParts = formatter.formatToParts(money, { locale: "en-US" });

/* result for example: {
  currency: '$',
  value: 1234.567,
  integer: '1,234',
  fraction: '.567',
  formatted: '1,234.567',
  display: '$1,234.567'
}
*/
```

### Formatting

The `MoneyFormatter` class and `format` methods accepts several options to customize:

- `locale` (string): The locale or country code, e.g. `'en-US'`, `'US'`.
- `roundStrategy` (RoundStrategy): The rounding strategy (`UP`, `DOWN`, `NEAREST`).
- `precision` (number): The number of decimal places to display.
- `trailingZeroDisplay` (boolean | Record<string, boolean>): If `true`, remove `.00` suffix.
- `preventGrouping` (boolean): If `true`, disables grouping separators for large numbers.
- `templates` (TemplateMap): Custom templates for formatting money (e.g. `"{currency}{integer|[delimiter]}{fraction|[delimiter]|[precision]}"`).
  - `currency`: Currency placeholder. e.g. `$`
  - `integer`: Integer placeholder with delimiter. e.g. `1.200.300`
  - `fraction`: Fraction placeholder with delimiter and precision. e.g. `,56`

### Usage

#### Manipulating money

```typescript
const money = new Money(1234.567);

const formattedMoney = money.add(500).discount(50).round(2).format({ locale: "AZ" });
```

#### Custom formatter

`custom-formatter.ts`

```typescript
import { MoneyFormatter } from "@enesbaspinar/money";

export const moneyFormatter = new MoneyFormatter({
  locale: "tr-TR", // or header, query, cookie, storage, config etc.
  overridedSymbols: {
    TR: "TL",
  },
  templates: {
    "*": "{integer|.}{fraction|,|2} {currency}",
  },
  trailingZeroDisplay: true,
});
```

`index.ts`

```typescript
import { MoneyFormat } from "@types";
import { moneyFormatter } from "./custom-formatter";

type Prices = {
  azPrice: number;
  originalPrice: number;
  discountedPrice: number;
};

type MappedPrices = {
  azPrice: MoneyFormat;
  originalPrice: MoneyFormat;
  discountedPrice: MoneyFormat;
};

const mapPrices = (price: Prices): MappedPrices => {
  return {
    azPrice: moneyFormatter.formatToParts(price.azPrice, { locale: "AZ" }),
    originalPrice: moneyFormatter.formatToParts(price.originalPrice),
    discountedPrice: moneyFormatter.formatToParts(price.discountedPrice),
  };
};

const mappedPrices = mapPrices({
  azPrice: 20.5,
  originalPrice: 167.434,
  discountedPrice: 150.2,
});

console.log(mappedPrices);

/* result:
{
  azPrice: {
    currency: '₼',
    value: 20.5,
    integer: '20',
    fraction: ',5',
    formatted: '20,5',
    display: '20,5 ₼'
  },
  originalPrice: {
    currency: 'TL',
    value: 167.434,
    integer: '167',
    fraction: ',43',
    formatted: '167,43',
    display: '167,43 TL'
  },
  discountedPrice: {
    currency: 'TL',
    value: 150.2,
    integer: '150',
    fraction: ',2',
    formatted: '150,2',
    display: '150,2 TL'
  }
*/
```

## Contributing

We welcome contributions. To get started:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and write tests if applicable.
4. Submit a pull request.

## License

Licensed under the [MIT License](LICENSE).
