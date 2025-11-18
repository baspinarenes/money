import { Money } from './entities/money';
import { MoneyInput } from './types';

export function money(value: MoneyInput): Money {
  return new Money(value);
}

export { ComparisonResult, RoundStrategy } from './types';
export type {
  FormatComponents, FormatOptions,
  FormatPart, MoneyInput, ParseOptions
} from './types';
export { money as createMoney, Money };

