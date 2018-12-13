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

      const signPart: '-'|undefined = <undefined|'-'> parts[1]; // Positive or negative
      const wholePart: string|undefined = parts[2]; // Whole numbers.
      const fracPart: string|undefined = parts[4];

      let output: bigint;
      // The whole part
      if (wholePart === undefined) {
        // For numbers like ".04" this part will be undefined.
        output = 0n;
      } else {
        output = BigInt(wholePart) * PRECISION_M;
      }

      if (fracPart !== undefined) {
        // The fractional part
        const precisionDifference: bigint = (PRECISION - BigInt(fracPart.length));

        if (precisionDifference >= 0) {
          // Add 0's
          output += BigInt(fracPart) * 10n ** precisionDifference;
        } else {
          // Remove 0's
          output += nearestEvenDivide(BigInt(fracPart), 10n ** (-precisionDifference));
        }
      }

      // negative ?
      if (signPart === '-') {
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
 * This function takes a bigint that was multiplied by PRECISON_M, and returns
 * a human readable string value with a specified precision.
 *
 * Precision is the number of decimals that are returned.
 */
export function bigintToFixed(value: bigint, precision: number) {

  if (precision === 0) {
    // No decimals were requested.
    return nearestEvenDivide(value, PRECISION_M).toString();
  }

  const wholePart = (value / PRECISION_M);
  const negative = value < 0;
  let remainder = (value % PRECISION_M);

  if (precision > PRECISION) {
    // More precision was requested than we have, so we multiply
    // to add more 0's
    remainder *= 10n ** (BigInt(precision) - PRECISION);
  } else {
    // Less precision was requested, so we round
    remainder = nearestEvenDivide(remainder, 10n ** (PRECISION - BigInt(precision)));
  }

  if (remainder < 0) { remainder *= -1n; }
  const remainderStr = remainder.toString().padStart(precision, '0');

  let wholePartStr = wholePart.toString();
  if (wholePartStr === '0' && negative) {
    wholePartStr = '-0';
  }

  return wholePartStr + '.' + remainderStr;
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

  // Get absolute versions. We'll deal with the negatives later.
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
