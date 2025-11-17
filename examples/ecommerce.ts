/**
 * E-commerce Shopping Cart Example
 * Demonstrates real-world usage in shopping cart scenarios
 */

import { money } from '../src/index';

console.log('=== E-commerce Shopping Cart Example ===\n');

// Shopping cart calculation
const itemPrice = money(29.99);
const quantity = 3;
const taxRate = 0.08;  // 8%
const discountPercent = 10;

console.log('Shopping Cart Calculation:');
console.log(`Item Price: ${itemPrice.format({ locale: 'en-US', currency: 'USD' })}`);
console.log(`Quantity: ${quantity}`);
console.log(`Tax Rate: ${(taxRate * 100).toFixed(0)}%`);
console.log(`Discount: ${discountPercent}%`);
console.log();

const subtotal = itemPrice.multiply(quantity);
const discount = subtotal.discount(discountPercent);
const tax = discount.multiply(taxRate);
const total = discount.add(tax);

console.log('Breakdown:');
console.log(`Subtotal: ${subtotal.format({ locale: 'en-US', currency: 'USD' })}`);
console.log(`Discount (${discountPercent}%): -${subtotal.subtract(discount).format({ locale: 'en-US', currency: 'USD' })}`);
console.log(`After Discount: ${discount.format({ locale: 'en-US', currency: 'USD' })}`);
console.log(`Tax (${(taxRate * 100).toFixed(0)}%): ${tax.format({ locale: 'en-US', currency: 'USD' })}`);
console.log(`Total: ${total.format({ locale: 'en-US', currency: 'USD' })}`);
console.log();

// Multiple items
console.log('Multiple Items:');
const items = [
  { name: 'Product A', price: money(19.99), quantity: 2 },
  { name: 'Product B', price: money(49.99), quantity: 1 },
  { name: 'Product C', price: money(9.99), quantity: 4 },
];

let cartTotal = money(0);
items.forEach((item) => {
  const itemTotal = item.price.multiply(item.quantity);
  cartTotal = cartTotal.add(itemTotal);
  console.log(`${item.name}: ${item.price.format({ locale: 'en-US', currency: 'USD' })} x ${item.quantity} = ${itemTotal.format({ locale: 'en-US', currency: 'USD' })}`);
});

console.log(`Cart Total: ${cartTotal.format({ locale: 'en-US', currency: 'USD' })}`);
console.log();

