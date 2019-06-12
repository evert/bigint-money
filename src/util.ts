import { UnsafeIntegerError } from './errors';
import { Money } from './money';

// How many digits we support
export const PRECISION_I = 20;

// bigint version. We keep both so there's less conversions.
export const PRECISION = BigInt(PRECISION_I);

// Multiplication factor for internal values
export const PRECISION_M = 10n ** PRECISION;

export enum Round {

  // The following rules are round to the nearest integer, but have different
  // rules for when it's right in the middle (.5).
  HALF_TO_EVEN = 1,
  BANKERS = 1, // Alias
  HALF_AWAY_FROM_0 = 2,
  HALF_TOWARDS_0 = 3,

  // These cases don't always round to the nearest integer
  TOWARDS_0 = 11, // Effectively drops the fractional part
  TRUNCATE = 11, // Alias
}


/**
 * This helper function takes a string, number or anything that can
 * be used in the constructor of a Money object, and returns a bigint
 * with adjusted precision.
 */
export function moneyValueToBigInt(input: Money | string | number | bigint, round: Round): bigint {

  if (input instanceof Money) {
    return input.toSource();
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
          output += divide(BigInt(fracPart), 10n ** (-precisionDifference), round);
        }
      }

      // negative ?
      if (signPart === '-') {
        output *= -1n;
      }
      return output;
    case 'bigint':
      return input * PRECISION_M;
    case 'number' :
      if (!Number.isSafeInteger(input)) {
        throw new UnsafeIntegerError('The number ' + input + ' is not a "safe" integer. It must be converted before passing it');
      }
      return BigInt(input) * PRECISION_M;
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
export function bigintToFixed(value: bigint, precision: number, round: Round) {

  if (precision === 0) {
    // No decimals were requested.
    return divide(value, PRECISION_M, round).toString();
  }

  let wholePart = (value / PRECISION_M);
  const negative = value < 0;
  let remainder = (value % PRECISION_M);

  if (precision > PRECISION) {
    // More precision was requested than we have, so we multiply
    // to add more 0's
    remainder *= 10n ** (BigInt(precision) - PRECISION);
  } else {
    // Less precision was requested, so we round
    remainder = divide(remainder, 10n ** (PRECISION - BigInt(precision)), round);
  }

  if (remainder < 0) { remainder *= -1n; }

  let remainderStr = remainder.toString().padStart(precision, '0');

  if (remainderStr.length > precision) {
    // The remainder rounded all the way up to the the 'whole part'
    wholePart += negative ? -1n : 1n;
    remainder = 0n;
    remainderStr = '0'.repeat(precision);
  }

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
export function divide(a: bigint, b: bigint, round: Round) {

  // Get absolute versions. We'll deal with the negatives later.
  const aAbs = a > 0 ? a : -a;
  const bAbs = b > 0 ? b : -b;

  let result = aAbs / bAbs;
  const rem = aAbs % bAbs;

  // if remainder > half divisor
  if (rem * 2n > bAbs) {
    switch (round) {
      case Round.TRUNCATE:
        // do nothing
        break;
      default :
        // We should have rounded up instead of down.
        result++;
        break;
    }
  } else if (rem * 2n === bAbs) {
    // If the remainder is exactly half the divisor, it means that the result is
    // exactly in between two numbers and we need to apply a specific rounding
    // method.
    switch (round) {
      case Round.HALF_TO_EVEN:
        // Add 1 if result is odd to get an even return value
        if (result % 2n === 1n) { result++; }
        break;
      case Round.HALF_AWAY_FROM_0:
        result++;
        break;
      case Round.TRUNCATE:
      case Round.HALF_TOWARDS_0:
        // Do nothing
        break;
    }
  }

  if (a > 0 !== b > 0) {
    // Either a XOR b is negative
    return -result;
  } else {
    return result;
  }

}
