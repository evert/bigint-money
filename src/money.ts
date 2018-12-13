import { IncompatibleCurrencyError } from './errors';
import {
  bigintToFixed,
  moneyValueToBigInt,
  nearestEvenDivide,
  PRECISION_M
} from './util';

export class Money {

  currency: string;
  value: bigint;

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
    const r = new Money(0, this.currency);
    r.value = addVal + this.value;
    return r;

  }

  subtract(val: Money | number | string): Money {

    if (val instanceof Money && val.currency !== this.currency) {
      throw new IncompatibleCurrencyError('You cannot subtract Money from different currencies. Convert first');
    }

    const subVal = moneyValueToBigInt(val);
    const r = new Money(0, this.currency);
    r.value = this.value - subVal;
    return r;

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

    const result = new Money(0, this.currency);
    result.value = nearestEvenDivide(val1, val2);
    return result;

  }

  /**
   * Multiply
   */
  multiply(val: number | string): Money {

    const valBig = moneyValueToBigInt(val);

    // Converting the dividor.
    const resultBig = valBig * this.value;

    const result = new Money(0, this.currency);
    result.value = nearestEvenDivide(resultBig, PRECISION_M);
    return result;


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

}
