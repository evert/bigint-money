import { IncompatibleCurrencyError } from './errors';
import { moneyValueToBigInt, nearestEvenDivide, PRECISION, PRECISION_M } from './util';

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

    if (precision === 0) {
      // No decimals were requested.
      return nearestEvenDivide(this.value, PRECISION_M).toString();
    }

    const wholePart = (this.value / PRECISION_M);
    const negative = this.value < 0;
    let remainder = (this.value % PRECISION_M);

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

}

