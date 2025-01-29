import { monetizer } from "../lib/entities/initializer";

const money = monetizer({
  locale: "en-GB",
  precision: {
    digit: 2,
  },
});

const formattedPrice = money(100).format();
const formattedPrice2 = money(100).format({
  trimDoubleZeros: true,
});
const formattedPrice3 = money(100.5).format();
const formattedPrice4 = money(100.5).format({
  trimPaddingZeros: true,
});

console.log(formattedPrice); // £100.00
console.log(formattedPrice2); // £100
console.log(formattedPrice3); // £100.50
console.log(formattedPrice4); // £100.5
