import { Money } from "../src/entities/money";

const money = new Money(1000.50);

const result = money.formatToComponents({
    locale: 'tr-TR',
    currency: 'TRY',
    precision: 2,
    templates: { default: '1.234,56 {Symbol:TL}' }
});

console.log(result);