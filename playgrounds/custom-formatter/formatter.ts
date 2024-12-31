import { MoneyFormatter } from "../../lib";

export const moneyFormatter = new MoneyFormatter({
  locale: "tr-TR", // or header, query, cookie, storage, config etc.
  overridedSymbols: {
    TR: "TL",
  },
  templates: {
    "*": "{integer|.}{fraction|,|2} {currency}",
  },
  trailingZeroDisplay: true,
});
