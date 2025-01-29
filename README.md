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

## Quick Start

Import the library and start using it to handle monetary values:

```typescript
import { money } from "@enesbaspinar/money";

const manipulatedMoney = money(12345.67).add(200).discount(0.5).round(2).amount;

console.log(manipulatedMoney); // 6272.84
```

Also format monetary values by locale:

```typescript
import { monetizer, RoundStrategy } from "@enesbaspinar/money";

const money = monetizer({ locale: "tr-TR" });
console.log(money(12345.67).format()); // ₺12.345,67

const advancedMoney = monetizer({
  locale: "tr-TR",
  precision: {
    digit: 2,
    strategy: RoundStrategy.DOWN,
  },
  preventGrouping: false,
  trimDoubleZeros: true,
  trimPaddingZeros: true,
  overridedSymbols: {
    TR: "TL",
  },
  templates: {
    "*": "{currency}{integer|,}{fraction|.}",
    TR: "{integer|,}{fraction|.} {currency}",
  },
});
console.log(advancedMoney(12345.67).format()); // 12,345.67 TL
console.log(advancedMoney(12345.67).format({ locale: "de-DE" })); // €12,345.67
```

## Documentation

## Contributing

We welcome contributions. To get started:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and write tests if applicable.
4. Submit a pull request.

## License

Licensed under the [MIT License](LICENSE).
