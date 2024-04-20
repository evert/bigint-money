import { Money, UnsafeIntegerError, IncompatibleCurrencyError } from '../src/index.js';
import { expect } from 'chai';
import { PRECISION_I } from '../src/util';
import { describe, it } from 'node:test';

describe('Money class', () => {

  it('should instantiate', () => {

    const m = new Money(1, 'USD');
    expect(m).to.be.an.instanceof(Money);
    expect(m.currency).to.equal('USD');

  });

  it('should error when instantiating with inprecise numbers', () => {

    expect( () => {
      new Money(1.1, 'yen');
    }).to.throw(UnsafeIntegerError);

  });

  it('should error when instantiating with bad string formats', () => {

    expect( () => {
      new Money('1,5', 'yen');
    }).to.throw(TypeError);

  });

  describe('toFixed', () => {

    const tests = [
      [1, 3, '1.000'],

      ['3.5', 0, '4'],
      ['-3.5', 0, '-4'],
      ['2.5', 0, '2'],
      ['-2.5', 0, '-2'],

      ['.35',  1, '0.4'],
      ['-.35', 1, '-0.4'],
      ['.25',  1, '0.2'],
      ['-.25', 1, '-0.2'],


      [1,       15, '1.' + ('0'.repeat(15))],
      ['1.555', 15, '1.555' + ('0'.repeat(12))],
      ['1.00555', 15, '1.00555' + ('0'.repeat(10))],

    ];

    for(const test of tests) {
      it(`should return ${test[2]} when calling toFixed on ${test[0]} with ${test[1]} precision`, () => {

        const m = new Money(test[0], 'USD');
        expect(m.toFixed(test[1] as number)).to.equal(test[2]);

      });
    }

  });
  describe('format', () => {

    const tests = [
      [1, '1'],

      ['1.005', '1.005'],
      ['1.0000', '1'],
      ['-12314.325400050500', '-12314.3254000505'],
      ['-5.0000', '-5'],

    ];

    for(const test of tests) {
      it(`should return ${test[1]} when calling format on ${test[0]}`, () => {

        const m = new Money(test[0], 'USD');
        expect(m.format()).to.equal(test[1]);

      });
    }

  });

  describe('Numbers with more precision than '+PRECISION_I+' digits', () => {

    const zeroes = '0'.repeat(PRECISION_I-1);

    it('should round to even', () => {

      const m = new Money('1.' + zeroes + '05', 'USD');
      expect(m).to.be.an.instanceof(Money);
      expect(m.currency).to.equal('USD');
      expect(m.toFixed(PRECISION_I + 1)).to.equal('1.' + zeroes + '00');

    });

    it('should round to even (2)', () => {

      const m = new Money('1.' + zeroes + '15', 'USD');
      expect(m).to.be.an.instanceof(Money);
      expect(m.currency).to.equal('USD');
      expect(m.toFixed(PRECISION_I + 1)).to.equal('1.' + zeroes + '20');

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

      ['17.954', '.001', '17.96'],

      ['0.002', '0.003', '0.00'],
      ['0.012', '0.003', '0.02'],
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

  describe('divide', () => {

    const cases = [
      ['1',   '3', '0.33'],
      ['-1' , '3', '-0.33'],
      ['1',  '-3', '-0.33'],
      ['-1', '-3', '0.33'],

      ['0.3',   '3', '0.10'],
      ['-0.3',  '3', '-0.10'],
      ['0.3',  '-3', '-0.10'],
      ['-0.3', '-3', '0.10'],

      // Round half even (down)
      ['3.015',   '3', '1.00'],
      ['-3.015',  '3', '-1.00'],
      ['3.015',  '-3', '-1.00'],
      ['-3.015', '-3', '1.00'],

      // Round half to even (up)
      ['3.045',   '3', '1.02'],
      ['-3.045',  '3', '-1.02'],
      ['3.045',  '-3', '-1.02'],
      ['-3.045', '-3', '1.02'],


    ];

    for (const cas of cases) {

      it(`${cas[0]} / ${cas[1]} = ${cas[2]}`, () => {

        const x = new Money(cas[0], 'ETH');
        expect(x.divide(cas[1]).toFixed(2)).to.equal(cas[2]);

      });

    }

  });

  describe('multiply', () => {

    const cases = [
      ['1', '3', '3.00'],
      ['10000', 20, '200000.00'],
      [20,   5, '100.00'],
      [-20,  5, '-100.00'],
      [-20, -5, '100.00'],
      [20,  -5, '-100.00'],
      ['0.5',   '0.2', '0.10'],
      ['-0.5',  '0.2', '-0.10'],
      ['-0.5', '-0.2', '0.10'],
      ['0.5',  '-0.2', '-0.10'],
    ];

    for (const cas of cases) {

      it(`${cas[0]} * ${cas[1]} = ${cas[2]}`, () => {

        const x = new Money(cas[0], 'ETH');
        expect(x.multiply(cas[1]).toFixed(2)).to.equal(cas[2]);

      });

    }

  });

  describe('pow', () => {

    const cases: [string|number, number, string][] = [
      ['1',  5,'1.00'],
      ['2',  8, '256.00'],
      [5,    3, '125.00'],
      [-10,  5, '-100000.00'],
      [-10,  1, '-10.00'],
      [-10,  0, '1.00'],
      [2,   -2, '0.25'],
    ];

    for (const cas of cases) {

      it(`${cas[0]} ** ${cas[1]} = ${cas[2]}`, () => {

        const x = new Money(cas[0], 'CAD');
        expect(x.pow(cas[1]).toFixed(2)).to.equal(cas[2]);

      });

    }

  });

  describe('abs', () => {

    const cases = [
      ['0', '0.00'],
      ['-1', '1.00'],
      ['-10000', '10000.00'],
      [20, '20.00'],
      [-20, '20.00'],
      ['0.5', '0.50'],
      ['-0.5', '0.50'],
    ];

    for (const cas of cases) {

      it(`abs(${cas[0]}) = ${cas[1]}`, () => {

        const x = new Money(cas[0], 'ETH');
        expect(x.abs().toFixed(2)).to.equal(cas[1]);

      });

    }

  });

  describe('sign', () => {

    const cases = [
      ['0', 0],
      ['-1', -1],
      ['-10000', -1],
      [20, 1],
      [-20, -1],
      ['0.5', 1],
      ['-0.5', -1],
    ];

    for (const cas of cases) {

      it(`sign(${cas[0]}) = ${cas[1]}`, () => {

        const x = new Money(cas[0], 'ETH');
        expect(x.sign()).to.equal(cas[1]);

      });

    }

  });

  describe('allocate', () => {

    const cases:any = [
      ['1', 3, 2, ['0.34', '0.33', '0.33']],
      ['-10', 7, 2, ['-1.43', '-1.43', '-1.43', '-1.43', '-1.43', '-1.43', '-1.42']],
    ];

    for(const cas of cases) {
      it(`splitting $${cas[0]} between ${cas[1]} people should result in ${(cas[3]).join(', ')}`, () => {

        const x = new Money(cas[0], 'CAD');
        const result = x.allocate(cas[1], cas[2]);

        expect(result.map( item => item.toFixed(cas[2]))).to.eql(cas[3]);

        // Double-check. Numbers must exactly add up to the source value
        expect(result.reduce( (acc, cur) => acc + cur.toSource(), 0n)).to.equal(x.toSource());

      });

    }
  });

  describe('toSource', () => {

    it('should return the underlying source bigint value', () => {

      const m = new Money(1, 'USD');
      expect(m.toSource()).to.equal(1n * (10n ** BigInt(PRECISION_I)));

    });

  });

  describe('Debug output', () => {

    it('should return a meaningful value', () => {

      const m = new Money(1, 'USD');
      expect((m as any)[Symbol.for('nodejs.util.inspect.custom')]()).to.equal('1 USD');

    });

  });

  describe('toJSON', () => {

    const cases = [
      ['1.000', '["1","DKK"]'],
      ['1.100', '["1.1","DKK"]'],
      ['1.111', '["1.111","DKK"]'],
      ['10.11', '["10.11","DKK"]'],
      ['10.00', '["10","DKK"]'],
    ];

    for(const cas of cases) {

      it(`${cas[0]} DKK should JSON stringify to ${cas[1]}`, () => {

        const m = new Money(cas[0], 'DKK');
        const result = JSON.stringify(m);
        expect(result).to.equal(cas[1]);

      });

    }

  });

});
