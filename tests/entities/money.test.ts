import { monetize, Money } from "../../lib";
import { LOG_PREFIX } from "@constants";
import { RoundStrategy } from "@enums";

describe.each([
  {
    name: "Money constructor",
    util: (amount: number) => new Money(amount),
  },
  {
    name: "Monetize function",
    util: monetize,
  },
])("$name tests", ({ util }) => {
  test("should throw an error when amount is not number", () => {
    expect(() => util(undefined as any)).toThrowError(`${LOG_PREFIX} Invalid money amount: ${undefined}`);
    expect(() => util(null as any)).toThrowError(`${LOG_PREFIX} Invalid money amount: ${null}`);
    expect(() => util("" as any)).toThrowError(`${LOG_PREFIX} Invalid money amount: ${""}`);
  });

  describe("Value getter tests", () => {
    test("should return the amount", () => {
      expect(util(5.625).value).toBe(5.625);
      expect(util(5).value).toBe(5);
      expect(util(0).value).toBe(0);
    });
  });

  describe("Integer getter tests", () => {
    test("should return the integer part", () => {
      expect(util(5.625).integer).toBe(5);
      expect(util(5).integer).toBe(5);
      expect(util(0).integer).toBe(0);
    });
  });

  describe("Fraction getter tests", () => {
    test("should return the fractional part", () => {
      expect(util(5.625).fraction).toBe(625);
      expect(util(5).fraction).toBe(0);
      expect(util(0).fraction).toBe(0);
    });
  });

  describe("Add method tests", () => {
    test("should return added money", () => {
      expect(util(5.625).add(2).value).toBe(7.625);
      expect(util(5.625).add(util(2.375)).value).toBe(8);
      expect(util(0.1).add(0.2).value).toBe(0.3);
      expect(util(Number.MAX_VALUE).add(1).value).toBe(Number.MAX_VALUE + 1);
      expect(util(Number.MIN_VALUE).add(-1).value).toBe(Number.MIN_VALUE - 1);
    });
  });

  describe("Subtract method tests", () => {
    test("should return subtracted money", () => {
      expect(util(5.625).subtract(2).value).toBe(3.625);
      expect(util(5.625).subtract(util(1.625)).value).toBe(4);
      expect(util(0.3).subtract(0.1).value).toBe(0.2);
      expect(util(Number.MIN_VALUE).subtract(1).value).toBe(Number.MIN_VALUE - 1);
      expect(util(Number.MAX_VALUE).subtract(-1).value).toBe(Number.MAX_VALUE + 1);
    });
  });

  describe("Multiply method tests", () => {
    test("should return multiplied money", () => {
      expect(util(5.625).multiply(2).value).toBe(11.25);
      expect(util(5.625).multiply(util(0.5)).value).toBe(2.8125);
      expect(util(0.1).multiply(0.2).value).toBe(0.02);
      expect(util(Number.MAX_VALUE).multiply(0).value).toBe(0);
      expect(util(Number.MIN_VALUE).multiply(0).value).toBe(0);
    });
  });

  describe("Divide method tests", () => {
    test("should return divided numbers", () => {
      expect(util(5.625).divide(2).value).toBe(2.8125);
      expect(util(5.625).divide(util(0.25)).value).toBe(22.5);
      expect(util(0.1).divide(0.2).value).toBe(0.5);
    });

    test("should throw an error when dividing by zero", () => {
      expect(() => util(5.625).divide(0)).toThrowError(`${LOG_PREFIX} Cannot divide by zero.`);
      expect(() => util(5.625).divide(util(0))).toThrowError(`${LOG_PREFIX} Cannot divide by zero.`);
    });
  });

  describe("Round method tests", () => {
    test("should return rounded numbers", () => {
      expect(util(5.625).round(2, RoundStrategy.UP).value).toBe(5.63);
      expect(util(5.625).round(2, RoundStrategy.DOWN).value).toBe(5.62);
      expect(util(5.625).round(2, RoundStrategy.NEAREST).value).toBe(5.63);
      expect(util(5.624).round(2, RoundStrategy.NEAREST).value).toBe(5.62);
      expect(util(5.625).round(0).value).toBe(6);
    });
  });

  describe("Discount method tests", () => {
    test("should return discounted money with 0-1 rate", () => {
      expect(util(100).discount(0.1).value).toBe(90);
      expect(util(50).discount(0.5).value).toBe(25);
      expect(util(25).discount(0).value).toBe(25);
      expect(util(12.5).discount(1).value).toBe(0);
    });

    test("should return discounted money with 0-100 rate", () => {
      expect(util(100).discount(10).value).toBe(90);
      expect(util(50).discount(50).value).toBe(25);
      expect(util(25).discount(0).value).toBe(25);
      expect(util(12.5).discount(100).value).toBe(0);
    });

    test("should throw an error for invalid discount rates", () => {
      expect(() => util(100).discount(-0.1)).toThrowError(`${LOG_PREFIX} Discount rate must be between 0-1 or 0-100.`);
      expect(() => util(100).discount(100.1)).toThrowError(`${LOG_PREFIX} Discount rate must be between 0-1 or 0-100.`);
    });

    test("should handle large numbers", () => {
      expect(util(Number.MAX_VALUE / 2).discount(0.5).value).toBe(Number.MAX_VALUE / 4);
    });
  });

  describe("Equal method tests", () => {
    test("should return true for equal money", () => {
      expect(util(0.1).add(0.2).equal(0.3)).toBe(true);
      expect(util(0.123).equal(0.123)).toBe(true);
      expect(util(0.1).add(0.2).equal(util(0.3))).toBe(true);
    });

    test("should return false for unequal money", () => {
      expect(util(0.1).equal(0.2)).toBe(false);
      expect(util(0.1).equal(util(0.2))).toBe(false);
    });
  });

  describe("Valueof method tests", () => {
    test("should return the amount", () => {
      expect(util(5.625).valueOf()).toBe(5.625);
      expect(util(0).valueOf()).toBe(0);
    });
  });

  describe("ToString method tests", () => {
    test("should return the amount", () => {
      expect(util(5.625).toString()).toBe("5.625");
      expect(util(0).toString()).toBe("0");
    });
  });
});
