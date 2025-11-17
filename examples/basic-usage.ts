import { money, RoundStrategy } from '../src/index';

console.log('=== Basic Usage Examples ===\n');

// Zero-config formatting (uses browser locale)
console.log('1. Zero-config formatting:');
console.log(money(100).format());
console.log(money(1000.50).format());
console.log();

// Math operations (chainable)
console.log('2. Chainable math operations:');
const result = money(100)
  .add(50)           // 150
  .multiply(2)       // 300
  .discount(10)      // 270 (10% discount)
  .round(2);
console.log(result.format({ locale: 'en-US', currency: 'USD' }));
console.log();

// Comparison
console.log('3. Comparison:');
const price1 = money(100);
const price2 = money(150);
console.log(`Price 1: ${price1.format({ locale: 'en-US', currency: 'USD' })}`);
console.log(`Price 2: ${price2.format({ locale: 'en-US', currency: 'USD' })}`);
console.log(`Equal: ${price1.equal(price2)}`);
console.log(`Comparison: ${price1.compare(price2)}`);
console.log();

// Rounding strategies
console.log('4. Rounding strategies:');
const value = money(100.456);
console.log(`Original: ${value.toString()}`);
console.log(`Round Nearest (default): ${value.round(2).toString()}`);
console.log(`Round Up: ${value.round(2, RoundStrategy.UP).toString()}`);
console.log(`Round Down: ${value.round(2, RoundStrategy.DOWN).toString()}`);
console.log();

// International formatting
console.log('5. International formatting:');
const amount = money(1234.56);
console.log(`US: ${amount.format({ locale: 'en-US', })}`);
console.log(`DE: ${amount.format({ locale: 'de-DE', })}`);
console.log(`TR: ${amount.format({ locale: 'tr-TR', })}`);
console.log(`JP: ${amount.format({ locale: 'ja-JP' })}`);
console.log(`JP: ${amount.format({ locale: 'az-AZ', currency: "TRY" })}`);