import { UnsafeIntegerError } from './errors';
import { Money } from './money';

// How many digits we support
export const PRECISION_I = 12;

// bigint version. We keep both so there's less conversions.
export const PRECISION = BigInt(PRECISION_I);

// Multiplication factor for internal values
export const PRECISION_M = 10n ** PRECISION;


/**
 * This helper function takes a string, number or anything that can
 * be used in the constructor of a Money object, and returns a bigint
 * with adjusted precision.
 */
export function moneyValueToBigInt(input: Money | string | number | bigint): bigint {

  if (input instanceof Money) {
    return input.value;
  }

  switch (typeof input) {
    case 'string' :
      const parts = input.match(/^(-)?([0-9]*)?(\.([0-9]*))?$/);

      if (!parts) {
        throw new TypeError('Input string must follow the pattern (-)##.## or -##');
      }

      let output: bigint;
      // The whole part
      if (parts[2] === undefined) {
        // For numbers like ".04" this part will be undefined.
        output = 0n;
      } else {
        output = BigInt(parts[2]) * PRECISION_M;
      }

      // The fractional part
      const precisionDifference: bigint = (PRECISION - BigInt(parts[4].length));

      if (precisionDifference >= 0) {
        // Add 0's
        output += BigInt(parts[4]) * 10n ** precisionDifference;
      } else {
        // Remove 0's
        output += nearestEvenDivide(BigInt(parts[4]), 10n ** (-precisionDifference));
      }

      // negative ?
      if (parts[1] === '-') {
        output *= -1n;
      }
      return output;
    case 'bigint':
      return input * PRECISION_M;
      break;
    case 'number' :
      if (!Number.isSafeInteger(input)) {
        throw new UnsafeIntegerError('The number ' + input + ' is not a "safe" integer. It must be converted before passing it');
      }
      return BigInt(input) * PRECISION_M;
      break;
    default :
      throw new TypeError('value must be a safe integer, bigint or string');

  }

}

/**
 * This function takes 2 bigints and divides them.
 *
 * By default ecmascript will round to 0. For example,
 * 5n / 2n yields 2n.
 *
 * This function rounds to the nearest even number, also
 * known as 'bankers rounding'.
 */
export function nearestEvenDivide(a: bigint, b: bigint) {

  /*
  let result: bigint = a / b;
  // if modulo is over half or equal to divisor
  if ((a % b) * 2n >= b) {
     // add 1 if result is odd
     if (result % 2n === 1n) { result++; }
  } else {
     // remove 1 if result is even
     if (result % 2n !== 1n) { result--; }
  }
  return result;

   */

  /*
  let result = a/b;
  // if modulo is over half or equal to divisor
  if ((a % b) * 2n >= b) {
     // If result was odd, go to nearest even
     if (result % 2n === 1n) {
        result += (result > 0) ? 1n : -1n;
     }
  }*/
  const aAbs = a > 0 ? a : -a;
  const bAbs = b > 0 ? b : -b;

  let result = aAbs / bAbs;
  const rem = aAbs % bAbs;
  // if remainder > half divisor, should have rounded up instead of down, so add 1
  if (rem * 2n > bAbs) {
      result ++;
  } else if (rem * 2n === bAbs) {
      // Add 1 if result is odd to get an even return value
      if (result % 2n === 1n) { result++; }
  }

  if (a > 0 !== b > 0) {
    // Either a XOR b is negative
    return -result;
  } else {
    return result;
  }

}
