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

    const fractionalPart = result.substr(Number(-PRECISION));
    let wholePart = result.substr(0, result.length - fractionalPart.length);

    if (wholePart === '') wholePart = '0';
    if (wholePart === '-') wholePart = '-0';

    if (precision === 0) {
      return wholePart;
    }

    if (precision > fractionalPart.length) {
      return wholePart + '.' + fractionalPart + ('0'.repeat(precision - fractionalPart.length));
    }

    // Caller wants less precision than we have. Strip digits.
    return wholePart + '.' + fractionalPart.substr(0, precision);

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
      const parts = input.match(/^(-)?([0-9]*)?(\.([0-9]*))?$/);

      if (!parts) {
        throw new TypeError('Input string must follow the pattern (-)##.## or -##');
      }

      let output:bigint;
      // The whole part
      if (parts[2] === undefined) {
        // For numbers like ".04" this part will be undefined.
        output = 0n;
      } else {
        output = BigInt(parts[2]) * PRECISION_M;
      }

      // The fractional part
      const precisionDifference:bigint = (PRECISION - BigInt(parts[4].length));

      // The length of the fraction is less than precision.
      // This should add or remove 0's on demand.
      output += BigInt(parts[4]) * 10n ** precisionDifference;

      // negative ?
      if (parts[1]==='-') {
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
