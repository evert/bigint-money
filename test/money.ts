import { Money, UnsafeIntegerError, IncompatibleCurrencyError } from '../src';
const { expect } = require('chai');

describe('Money class', () => {

  it('should instantiate', () => {

    const m = new Money(1, 'USD');
    expect(m).to.be.an.instanceof(Money);
    expect(m.currency).to.equal('USD');

  });

  it('should error when instantiating with inprecise numbers', () => {

    expect( () => {
      new Money(1.1, 'YEN');
    }).to.throw(UnsafeIntegerError);

  });

  describe('toFixed', () => {

    it('should return 1.000 when asked for 3 decimals', () => {

      const m = new Money(1, 'USD');
      expect(m.toFixed(3)).to.equal('1.000');

    });

  });

  describe('add', () => {

    it('should return a new Money object with the added number', () => {

      const x = new Money(1, 'USD');
      const y = new Money(2, 'USD');
      const z = y.add(x);

      expect(z.toFixed(3)).to.equal('3.000');

    });

    it('should work with non-money objects', () => {

      const x = 1;
      const y = new Money(2, 'USD');
      const z = y.add(x);

      expect(z.toFixed(3)).to.equal('3.000');

    });

    it('should error when using different currencies', () => {

      const x = new Money(1, 'USD');
      const y = new Money(2, 'YEN');

      expect( () => y.add(x)).to.throw(IncompatibleCurrencyError);

    });

    const cases = [
      ['0.1', '0.2', '0.30'],
      ['0.3', '-0.2', '0.10'],
      [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, '18014398509481982.00'],
      // If these were floats, we'd expect this to round to 17.96. Without
      // rounding errors, this should go to 17.95
      ['17.954', '.001', '17.95'],
    ];

    for(const cas of cases) {

      it(`${cas[0]} + ${cas[1]} = ${cas[2]}`, () => {

        const x = new Money(cas[0], 'USD');
        const y = new Money(cas[1], 'USD');

        expect(x.add(y).toFixed(2)).to.equal(cas[2]);

      });

    }

  });

  describe('subtract', () => {

    it('should return a new Money object with the subtracted number', () => {

      const x = new Money(1, 'USD');
      const y = new Money(2, 'USD');
      const z = x.subtract(y);

      expect(z.toFixed(3)).to.equal('-1.000');

    });

    it('should work with non-money objects', () => {

      const x = 3;
      const y = new Money(2, 'USD');
      const z = y.subtract(x);

      expect(z.toFixed(3)).to.equal('-1.000');

    });

    it('should error when using different currencies', () => {

      const x = new Money(1, 'USD');
      const y = new Money(2, 'YEN');

      expect( () => y.subtract(x)).to.throw(IncompatibleCurrencyError);

    });

    const cases = [
      ['0.1', '0.2', '-0.10'],
      ['0.3', '-0.2', '0.50'],
      // These are larger than MAX_SAFE_INT
      ['9007199254740992.555555555','9007199254740992.555555555', '0.00'],
    ];

    for(const cas of cases) {

      it(`${cas[0]} + ${cas[1]} = ${cas[2]}`, () => {

        const x = new Money(cas[0], 'USD');
        const y = new Money(cas[1], 'USD');

        expect(x.subtract(y).toFixed(2)).to.equal(cas[2]);

      });

    }


  });

});
