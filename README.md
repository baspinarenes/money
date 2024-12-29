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

This package provides two classes. These are:

- `Money`: A utility class for performing arithmetic operations on monetary values.

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

<br/>

`subtract(amount: number | Money): Money`

Subtracts the specified amount to current `Money` instance and returns `Money` instance.

```typescript
const newMoney = money.subtract(50); // 1184.567
```

<br/>

`multiply(amount: number | Money): Money`

Multiplies the current `Money` instance by the specified amount and returns `Money` instance.

```typescript
const newMoney = money.multiply(2); // 2469,134
```

<br/>

`divide(amount: number | Money): Money`

Divides the current `Money` instance by the specified amount and returns `Money` instance.

```typescript
const newMoney = money.divide(2); // 617,2835
```

Throws:

- Throws an error if attempting to divide by zero.

<br/>

`round(decimals: number, strategy?: RoundStrategy): Money`

Rounds the current `Money` instance to the specified number of decimal places using a specified rounding strategy. Default: `RoundStrategy.NEAREST`

```typescript
const roundedMoney = money.round(1, RoundStrategy.DOWN); // 1234,5
```

<br/>

`discount(rate: number): Money`

Applies a discount to the current `Money` instance based on the given rate (expressed as a percentage) and returns `Money` instance. The rate could be in 0-1 or 0-100 ranges.

```typescript
const discountedMoney = money.discount(20); // 987.6536
```

<br/>

`equal(amount: number | Money): boolean`

Compares the current `Money` instance to another amount or `Money` instance. Returns `true` if they are equal, otherwise `false`.

```typescript
const isEqual = money.equal(1234.567); // true
```

<br/>

`valueOf(): number`

Returns the amount of the `Money` instance.

```typescript
const rawValue = money.valueOf(); // 1234.567
```

<br/>

`toString(): string`

Returns a string representation of the `Money` instance.

```typescript
const stringValue = money.toString(); // '1234.567'
```

<br/>

### Usage

#### Manipulating money

```typescript
const money = new Money(1234.567);
const formattedMoney = money.add(500).discount(50).round(2); // 867,28
```

## Contributing

We welcome contributions. To get started:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and write tests if applicable.
4. Submit a pull request.

## License

PriceFormatter is licensed under the [MIT License](LICENSE).
