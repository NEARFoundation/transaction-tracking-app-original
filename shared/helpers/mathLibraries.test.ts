// This file is just to help understand 3rd party libraries.

// https://jestjs.io/docs/getting-started#using-typescript

import exactMath from 'exact-math'; // https://www.npmjs.com/package/exact-math
import { Decimal } from 'decimal.js'; // https://github.com/MikeMcl/decimal.js

const testCases = [
  // The following cases work in exact-math but fail in Decimal.js:
  '9999513263875304671192000009',
  '4513263875304671192000009',
  '530467119.530467119',
  // The following cases fail in both Decimal.js and exact-math:
  '1.1998679030467029262556391239', // exact-math rounds these 28 decimal places to just 17: "1.1998679030467029263000000000"
];

describe('decimals.js', () => {
  testCases.forEach((testCase) => {
    test(testCase, () => {
      expect(new Decimal(testCase).div(new Decimal(1)).toFixed(28)).toBe(testCase); // Dividing by 1 (very simple!)
    });
  });
});

describe('exact-math', () => {
  testCases.forEach((testCase) => {
    test(testCase, () => {
      expect(exactMath.div(testCase, 1, { returnString: true })).toBe(testCase); // Dividing by 1 (very simple!)
    });
  });
});
