import Big from "big.js";

export const equal = (_x: number, _y: number) => {
  const x = new Big(_x);
  const y = new Big(_y);
  return x.eq(y);
};

export const plus = (_x: number, _y: number) => {
  const x = new Big(_x);
  const y = new Big(_y);
  return x.plus(y).toNumber();
};

export const minus = (_x: number, _y: number) => {
  const x = new Big(_x);
  const y = new Big(_y);
  return x.minus(y).toNumber();
};

export const multiply = (_x: number, _y: number) => {
  const x = new Big(_x);
  const y = new Big(_y);
  return x.times(y).toNumber();
};

export const divide = (_x: number, _y: number) => {
  const x = new Big(_x);
  const y = new Big(_y);
  return x.div(y).toNumber();
};

export const ceil = (_x: number, decimal: number) => {
  const x = new Big(_x);
  return x.round(decimal, 3).toNumber();
};

export const pow = (_x: number, decimal: number) => {
  const x = new Big(_x);
  return x.pow(decimal).toNumber();
};

export const round = (_x: number, decimal: number) => {
  const x = new Big(_x);
  return x.round(decimal, 1).toNumber();
};

export const floor = (_x: number, decimal: number) => {
  const x = new Big(_x);
  return x.round(decimal, 0).toNumber();
};
