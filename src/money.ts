import { IncompatibleCurrencyError } from './errors';
import {
  bigintToFixed,
  moneyValueToBigInt,
  nearestEvenDivide,
  PRECISION,
  PRECISION_I,
  PRECISION_M,
} from './util';

export class Money {

  currency: string;
  private value: bigint;

  constructor(value: number | bigint | string, currency: string) {

    this.currency = currency;
    this.value = moneyValueToBigInt(value);

  }

  /**
   * Return a string representation of the money value.
   *
   * Precision is a number of decimals that was requested. The decimals are
   * always returned, e.g.: new Money(1, 'USD').toFixed(2) returns '1.00'.
   *
   * This function rounds to even, a.k.a. it uses bankers rounding.
   */
  toFixed(precision: number): string {

    return bigintToFixed(this.value, precision);

  }

  add(val: Money | number | string): Money {

    if (val instanceof Money && val.currency !== this.currency) {
      throw new IncompatibleCurrencyError('You cannot add Money from different currencies. Convert first');
    }

    const addVal = moneyValueToBigInt(val);
    const r = Money.fromSource(addVal + this.value, this.currency);
    return r;

  }

  subtract(val: Money | number | string): Money {

    if (val instanceof Money && val.currency !== this.currency) {
      throw new IncompatibleCurrencyError('You cannot subtract Money from different currencies. Convert first');
    }

    const subVal = moneyValueToBigInt(val);
    return Money.fromSource(this.value - subVal, this.currency);

  }

  /**
   * Divide the current number with the specified number.
   *
   * This function returns a new Money object with the result.
   */
  divide(val: number | string ): Money {

    // Even though val1 was already in 'bigint' format, we run this
    // again as otherwise we will lose precision.
    //
    // This means for an original of $1 this would now be $1 * 10**24.
    const val1 = moneyValueToBigInt(this.value);

    // Converting the dividor.
    const val2 = moneyValueToBigInt(val);

    return Money.fromSource(
      nearestEvenDivide(val1, val2),
      this.currency
    );

  }

  /**
   * Multiply
   */
  multiply(val: number | string): Money {

    const valBig = moneyValueToBigInt(val);

    // Converting the dividor.
    const resultBig = valBig * this.value;

    return Money.fromSource(
      nearestEvenDivide(resultBig, PRECISION_M),
      this.currency
    );


  }

  /**
   * Compares this Money object with another value.
   *
   * If the values are equal, 0 is returned.
   * If this object is considered to be lower, -1 is returned.
   * If this object is considered to be higher, 1 is returned.
   */
  compare(val: number | string | Money): -1 | 0 | 1 {

    if (val instanceof Money && val.currency !== this.currency) {
      throw new IncompatibleCurrencyError('You cannot compare different currencies.');
    }

    const bigVal = moneyValueToBigInt(val);
    if (bigVal === this.value) { return 0; }
    return this.value < bigVal ? -1 : 1;

  }

  /**
   * Allocate this value to different parts.
   *
   * This is useful in cases no money can be lost when splitting in different
   * parts. For example, when splitting $1 between 3 people, this function will
   * return 3.34, 3.33, 3.33.
   *
   * The remainder of the split will be added round-robin to the results,
   * starting with the first group.
   *
   * The reason precision must be specified, is because under the hood this
   * library uses 12 digits for precision. But when splitting a whole dollar,
   * you might only be interested in cents (precision = 2).
   *
   *
   */
  allocate(parts: number, precision: number): Money[] {

    const bParts = BigInt(parts);

    // Javascript will round to 0.
    const fraction = this.value / bParts;
    const remainder = this.value % bParts;

    // This value is used for rounding to the desired precision
    const precisionRounder = BigInt(10) ** (PRECISION - BigInt(precision));

    const roundedFraction = (fraction / precisionRounder);
    const roundedRemainder = fraction % precisionRounder;

    // We had 2 division operators, and we want to keep remainders for both
    // of them.
    const totalRoundedRemainder = ((roundedRemainder + remainder) * bParts) / precisionRounder;

    const result: Array<bigint> = Array(parts).fill(roundedFraction);

    // Figure out how many spare 'cents' we need to distribute. If the number
    // is negative, we need to spread debt instead.
    const add = BigInt(totalRoundedRemainder > 0 ? 1 : -1);

    for (let i = 0; i < Math.abs(Number(totalRoundedRemainder)); i++) {
      result[i] += add;
    }

    return result.map( item => {

      return Money.fromSource(
        item * precisionRounder,
        this.currency
      );

    });

  }

  /**
   * Returns the underlying bigint value.
   *
   * This is the current value of the object, multiplied by 10 ** 12.
   */
  toSource(): bigint {

    return this.value;

  }

  /**
   * A factory function to construct a Money object a 'source' value.
   *
   * The source value is just the underlying bigint used in the Money
   * class and can be obtained by calling Money.getSource().
   */
  static fromSource(val: bigint, currency: string): Money {

    const m = new Money(0, currency);
    m.value = val;

    return m;

  }

  /**
   * This function creates custom output in console.log statements.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {

    // The 4-digit choice is arbitrary. Might revise this.
    return this.toFixed(4) + ' ' + this.currency;

  }

  /**
   * A default output for serializing to JSON
   */
  toJSON(): [string, string] {

    return [this.format(), this.currency];

  }

  /**
   * This function will return a string with all irrelevant 0's removed.
   */
  format(): string {

    return this.toFixed(PRECISION_I).replace(/\.?0+$/, '');

  }

}
