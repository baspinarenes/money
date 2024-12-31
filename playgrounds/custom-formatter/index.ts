import { MoneyFormat } from "../../lib";
import { moneyFormatter } from "./formatter";

type Prices = {
  azPrice: number;
  originalPrice: number;
  discountedPrice: number;
};

type MappedPrices = {
  azPrice: MoneyFormat;
  originalPrice: MoneyFormat;
  discountedPrice: MoneyFormat;
};

const mapPrices = (price: Prices): MappedPrices => {
  return {
    azPrice: moneyFormatter.formatToParts(price.azPrice, { locale: "AZ" }),
    originalPrice: moneyFormatter.formatToParts(price.originalPrice),
    discountedPrice: moneyFormatter.formatToParts(price.discountedPrice),
  };
};

const mappedPrices = mapPrices({
  azPrice: 20.5,
  originalPrice: 167.434,
  discountedPrice: 150.2,
});

console.log("mappedPrices", mappedPrices);
