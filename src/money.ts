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

    if (precision < PRECISION) {

      // Divide so so the big internal value rounds to the desired
      // precision.
      const intermediate = nearestEvenDivide(this.value, 10n ** (PRECISION - BigInt(precision))).toString();

      // Now we just have to put the peroid in the right spot.
      let wholePart = intermediate.slice(0, intermediate.length - precision);
      const fracPart = intermediate.slice(intermediate.length - precision);

      // wholePart may be empty
      if (wholePart === '' || wholePart === '-') {
        wholePart += '0';
      }

      console.log('%s-%s-%s', intermediate, wholePart, fracPart);

      return wholePart + '.' + fracPart;

    }


    // The user asked for more precision than was available, we just gotta
    // pad with 0's.
    const wholePart: bigint = this.value / PRECISION_M;
    const fracPart: bigint = this.value % PRECISION_M;

    const fracStr = fracPart.toString();

    // Add 0's
    return wholePart.toString() + '.' + fracStr + ('0'.repeat(precision - fracStr.length));

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

