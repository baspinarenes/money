import { monetizer } from "../lib/entities/initializer";

const money = monetizer({
  locale: "tr-TR",
  overridedSymbols: {
    AZ: "₺",
    "*": "$",
  },
});

const formattedPrice = money(5000000.1456).format();
const formattedPrice2 = money(5000000.1456).format({
  locale: "AZ",
});

console.log(formattedPrice); // $5.000.000,1456
console.log(formattedPrice2); // 5.000.000,1456₺
