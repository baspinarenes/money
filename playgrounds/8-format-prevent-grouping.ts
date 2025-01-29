import { monetizer } from "../lib/entities/initializer";

const money = monetizer({
  locale: "en-GB",
  precision: {
    digit: 2,
  },
  trimDoubleZeros: true,
});

const formattedPrice = money(10000000000000).format();
const formattedPrice2 = money(10000000000000).format({
  preventGrouping: true,
});

console.log(formattedPrice); // £10,000,000,000,000
console.log(formattedPrice2); // £10000000000000
