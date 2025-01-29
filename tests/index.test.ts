import * as index from "../lib";
import { money, monetizer, createMoney } from "@entities";
import { RoundStrategy } from "@enums";

const allowedExports = { money, monetizer, createMoney, RoundStrategy };

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
