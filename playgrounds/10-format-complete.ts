import { createMoney } from "@entities";

const money = createMoney({
  locale: "en-US",
  templates: {
    "en-US": "{currency}{integer|,}{fraction|.|2}",
    "de-DE": "{integer|.}{fraction|,|3}{currency}",
    "*": "{integer|,}{fraction|.|3} {currency}",
  },
  precision: { digit: 2, strategy: "nearest" },
});

const amounts = [5, 1234.567, 12345678.5, 89.0000001, 0];

console.log("Locale: en-US");
amounts.forEach((amount) => {
  console.log(money(amount).format({ trimDoubleZeros: true }));
});

console.log("\nLocale: TR");
amounts.forEach((amount) => {
  console.log(money(amount).format({ locale: "TR", trimPaddingZeros: true }));
});
