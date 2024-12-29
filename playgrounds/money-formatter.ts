import { MoneyFormatter, MoneyFormatterOptions, RoundStrategy } from "../lib";

const templates = {
  "en-US": "{currency}{integer|,}{fraction|.|2}",
  "de-DE": "{integer|.}{fraction|,|3}{currency}",
  "*": "{integer|,}{fraction|.|3} {currency}",
};

const optionsList: MoneyFormatterOptions[] = [
  {
    locale: "en-US",
    templates: templates,
    trailingZeroDisplay: true,
    roundStrategy: RoundStrategy.NEAREST,
    precision: 2,
  },
  {
    locale: "de-DE",
    templates: templates,
    trailingZeroDisplay: false,
    roundStrategy: RoundStrategy.UP,
    precision: 3,
  },
  {
    locale: "fr-FR",
    templates: templates,
    trailingZeroDisplay: { "tr-TR": true, "*": false },
    roundStrategy: RoundStrategy.DOWN,
    overridedSymbols: { "fr-FR": "€" },
  },
];

optionsList.forEach((options, index) => {
  try {
    console.log(`\n--- Example ${index + 1} ---`);
    const formatter = MoneyFormatter.create(options);

    const amounts = [5, 1234.567, 12345678.5, 89.0000001, 0];
    amounts.forEach((amount) => {
      console.log(`Formatted (${options.locale}) for ${amount}: `, formatter.format(amount));
    });

    const parts = formatter.formatToParts(1234.567);
    console.log(`Formatted parts (${options.locale}): `, parts);
  } catch (error) {
    console.error("Error: ", error.message);
  }
});
