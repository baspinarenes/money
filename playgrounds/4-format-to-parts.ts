import { money } from "../lib/entities/initializer";

const formattedPriceParts = money(5000000.1456).formatToParts({
  locale: "de-DE",
});

const formattedPriceParts2 = money(5000000.1456).formatToParts({
  locale: "tr-TR",
});

const formattedPriceParts3 = money(5000000.1456).formatToParts({
  locale: "en-GB",
});

console.log(formattedPriceParts);
console.log(formattedPriceParts2);
console.log(formattedPriceParts3);

/*
{
  currency: '€',
  value: 5000000.1456,
  integer: '5.000.000',
  fraction: ',1456',
  formatted: '5.000.000,1456',
  display: '5.000.000,1456€'
}
{
  currency: '₺',
  value: 5000000.1456,
  integer: '5.000.000',
  fraction: ',1456',
  formatted: '5.000.000,1456',
  display: '₺5.000.000,1456'
}
{
  currency: '£',
  value: 5000000.1456,
  integer: '5,000,000',
  fraction: '.1456',
  formatted: '5,000,000.1456',
  display: '£5,000,000.1456'
}
*/
