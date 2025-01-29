import { monetizer } from "../lib/entities/initializer";

const money = monetizer({
  locale: "tr-TR",
});

const advancedMoney = monetizer({
  locale: "tr-TR",
  overridedSymbols: {
    TR: "TL",
  },
  templates: {
    "*": "{currency}{integer|,}{fraction|.}",
    TR: "{integer|,}{fraction|.} {currency}",
  },
});

const formattedPrice = money(12345.67).format();
const formattedPrice2 = advancedMoney(12345.67).format();

console.log(formattedPrice); // ₺12.345,67
console.log(formattedPrice2); // 12,345.67 TL
