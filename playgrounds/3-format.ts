import { money } from "../lib/entities/initializer";

const formattedPrice = money(5000000.1456).format({
  locale: "DE",
});

const formattedPrice2 = money(5000000.1456).format({
  locale: "de-DE",
});

const formattedPrice3 = money(5000000.1456).format({
  locale: "tr-TR",
});

console.log(formattedPrice); // 5.000.000,1456€
console.log(formattedPrice2); // 5.000.000,1456€
console.log(formattedPrice3); // ₺5.000.000,1456
