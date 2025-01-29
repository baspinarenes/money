import { RoundStrategy } from "@enums";
import { monetizer } from "../lib/entities/initializer";

const money = monetizer({
  locale: "tr-TR",
  precision: {
    digit: 2,
    strategy: RoundStrategy.NEAREST,
  },
});

const formattedPrice = money(10.5555).format();

console.log(formattedPrice); // ₺10,56
