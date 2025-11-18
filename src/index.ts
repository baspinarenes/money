import { Money } from './entities/money';
import { MoneyInput } from './types';

const money = (value: MoneyInput) =>  new Money(value);

export { ComparisonResult, RoundStrategy } from './types';
export type {
  FormatComponents, FormatOptions,
  FormatPart, MoneyInput, ParseOptions
} from './types';
export { money as createMoney, money, Money };

