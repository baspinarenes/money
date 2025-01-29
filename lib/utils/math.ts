import Big from "big.js";

export const equal = (_x: number, _y: number) => {
  const x = new Big(_x);
  const y = new Big(_y);
  return x.eq(y);
};

export const plus = (_x: number, _y: number) => {
  const x = new Big(_x);
  const y = new Big(_y);
  return x.plus(y);
};

export const minus = (_x: number, _y: number) => {
  const x = new Big(_x);
  const y = new Big(_y);

  return x.minus(y);
};

export const multiply = (_x: number, _y: number) => {
  const x = new Big(_x);
  const y = new Big(_y);
  return x.times(y);
};

export const divide = (_x: number, _y: number) => {
  const x = new Big(_x);
  const y = new Big(_y);
  return x.div(y);
};

export const ceil = (_x: number, decimal: number) => {
  const x = new Big(_x);
  return x.round(decimal, 3);
};

export const pow = (_x: number, decimal: number) => {
  const x = new Big(_x);
  return x.pow(decimal);
};

export const round = (_x: number, decimal: number) => {
  const x = new Big(_x);
  return x.round(decimal, 1);
};

export const floor = (_x: number, decimal: number) => {
  const x = new Big(_x);
  return x.round(decimal, 0);
};
