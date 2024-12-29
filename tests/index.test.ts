import * as index from "../lib";
import { Money, monetize, MoneyFormatter } from "@entities";
import { RoundStrategy } from "@enums";

const allowedExports = { Money, monetize, MoneyFormatter, RoundStrategy };

describe("Index tests", () => {
  it("should only export allowed entities", () => {
    const indexExports = Object.keys(index).reduce((acc, key) => {
      if (key !== "__esModule") {
        acc[key] = (index as Record<string, any>)[key];
      }
      return acc;
    }, {} as Record<string, any>);

    expect(indexExports, "Index should contain all allowed exports").toEqual(allowedExports);
  });
});
