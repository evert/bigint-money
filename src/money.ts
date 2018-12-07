import { IncompatibleCurrencyError, UnsafeIntegerError } from './errors';

// How many digits we support
const PRECISION_I = 12;

// bigint version. We keep both so there's less conversions.
const PRECISION = BigInt(PRECISION_I);

// Multiplication factor for internal values
const PRECISION_M = 10n ** PRECISION;

export class Money {

  currency: string;
  value: bigint;

  constructor(value: number | bigint | string, currency: string) {

    this.currency = currency;

    this.value = moneyValueToBigInt(value);

  }

  toFixed(precision: number): string {

    const result = this.value.toString();
    if (precision > PRECISION) {
      // caller wants more precision than we have, add 0's.
      return result.substr(0, result.length - PRECISION_I) +
        '.' + result.substr(result.length - PRECISION_I) +
        '0'.repeat(precision - PRECISION_I);
    } else {
      // Caller wants less precision than we have. Strip digits.
      return result.substr(0, result.length - PRECISION_I) +
        '.' + result.substr(-(PRECISION_I - precision), precision);
    }

  }

  add(val: Money | number): Money {

    if (val instanceof Money && val.currency !== this.currency) {
      throw new IncompatibleCurrencyError('You cannot add Money from different currencies. Convert first');
    }

    const addVal = moneyValueToBigInt(val);
    const r = new Money(0, this.currency);
    r.value = addVal + this.value;
    return r;

  }

  subtract(val: Money | number): Money {

    if (val instanceof Money && val.currency !== this.currency) {
      throw new IncompatibleCurrencyError('You cannot subtract Money from different currencies. Convert first');
    }

    const subVal = moneyValueToBigInt(val);
    const r = new Money(0, this.currency);
    r.value = this.value - subVal;
    return r;

  }

}

/**
 * This helper function takes a string, number or anything that can
 * be used in the constructor of a Money object, and returns a bigint
 * with adjusted precision.
 */
function moneyValueToBigInt(input: Money | string | number | bigint): bigint {

  if (input instanceof Money) {
    return input.value;
  }

  switch (typeof input) {
    case 'string' :
      const parts = input.split('.');
      const output = BigInt(parts[0]) ** PRECISION_M;
      if (parts.length === 2) {
        throw new Error('Fractions are not yet supported in strings');
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
