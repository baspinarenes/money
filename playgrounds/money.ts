import { Money, monetize, RoundStrategy } from "../lib";

const money1 = new Money(123.456);
const money2 = monetize(78.543);

console.log("Money1 Value:", money1.value);
console.log("Money2 Value:", money2.value);

console.log("Money1 Integer Part:", money1.integer);
console.log("Money1 Fraction Part:", money1.fraction);

const sum = money1.add(money2);
console.log("Sum:", sum.value);

const difference = money1.subtract(money2);
console.log("Difference:", difference.value);

const product = money1.multiply(2);
console.log("Product:", product.value);

try {
  const quotient = money1.divide(2);
  console.log("Quotient:", quotient.value);
} catch (error) {
  console.error(error);
}

const rounded = money1.round(2, RoundStrategy.NEAREST);
console.log("Rounded (2 decimals):", rounded.value);

const roundedUp = money1.round(2, RoundStrategy.UP);
console.log("Rounded Up (2 decimals):", roundedUp.value);

const roundedDown = money1.round(2, RoundStrategy.DOWN);
console.log("Rounded Down (2 decimals):", roundedDown.value);

try {
  const discounted = money1.discount(10);
  console.log("Discounted (10%):", discounted.value);
} catch (error) {
  console.error(error);
}

console.log("Money1 equals Money2:", money1.equal(money2));
console.log("Money1 equals 123.456:", money1.equal(123.456));

console.log("Money1 String:", money1.toString());

console.log("Value of Money1:", money1.valueOf());
