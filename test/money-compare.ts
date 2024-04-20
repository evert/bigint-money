import { Money, IncompatibleCurrencyError } from '../src/index.js';
import { expect } from 'chai';
import { describe, it } from 'node:test';

describe('Money.compare', () => {

  const cases = [
    ['1', '2', -1],
    ['-10', '-20', 1],
    ['1', 1, 0],
    ['-100', '100', -1],
    ['-0', 0, 0],
    ['1.00000001', '1.00000002', -1],
    ['1.00000003', '1.00000002', 1],
  ];

  for (const cas of cases) {

    let op;
    switch(cas[2]) {
      case -1:
        op = '<';
        break;
      case 0 :
        op = '===';
        break;
      case 1:
        op = '>';
        break;
    }
    it(`${cas[0]} ${op} ${cas[1]} === true`, () => {

      const x = new Money(cas[0], 'AUD');
      expect(x.compare(cas[1])).to.equal(cas[2]);

    });

  }

  it('should fail when using incompatible currencies', () => {

    const x = new Money(1, 'AUD');
    const y = new Money(2, 'NZD');
    expect(() => x.compare(y)).to.throw(IncompatibleCurrencyError);

  });

});

describe('Money.isLesserThan', () => {

  const cases:any = [
    ['1', '2', true],
    ['-10', '-20', false],
    ['1', 1, false],
    ['-100', '100', true],
    ['-0', 0, false],
    ['1.00000001', '1.00000002', true],
    ['1.00000003', '1.00000002', false],
  ];

  for (const cas of cases) {

    it(`${cas[0]}.isLesserThan(${cas[1]}) === true`, () => {

      const x = new Money(cas[0], 'AUD');
      expect(x.isLesserThan(cas[1])).to.equal(cas[2]);

    });

  }

});

describe('Money.isGreaterThan', () => {

  const cases:any = [
    ['1', '2', false],
    ['-10', '-20', true],
    ['1', 1, false],
    ['-100', '100', false],
    ['-0', 0, false],
    ['1.00000001', '1.00000002', false],
    ['1.00000003', '1.00000002', true],
  ];

  for (const cas of cases) {

    it(`${cas[0]}.isGreaterThan(${cas[1]}) === true`, () => {

      const x = new Money(cas[0], 'AUD');
      expect(x.isGreaterThan(cas[1])).to.equal(cas[2]);

    });

  }

});

describe('Money.isEqual', () => {

  const cases:any = [
    ['1', '2', false],
    ['-10', '-20', false],
    ['1', 1, true],
    ['-100', '100', false],
    ['-0', 0, true],
    ['1.00000001', '1.00000002', false],
    ['1.00000003', '1.00000002', false],
  ];

  for (const cas of cases) {

    it(`${cas[0]}.isEqual(${cas[1]}) === true`, () => {

      const x = new Money(cas[0], 'AUD');
      expect(x.isEqual(cas[1])).to.equal(cas[2]);

    });

  }

});

describe('Money.isLesserThanOrEqual', () => {

  const cases:any = [
    ['1', '2', true],
    ['-10', '-20', false],
    ['1', 1, true],
    ['-100', '100', true],
    ['-0', 0, true],
    ['1.00000001', '1.00000002', true],
    ['1.00000003', '1.00000002', false],
  ];

  for (const cas of cases) {

    it(`${cas[0]}.isLesserThanOrEqual(${cas[1]}) === true`, () => {

      const x = new Money(cas[0], 'AUD');
      expect(x.isLesserThanOrEqual(cas[1])).to.equal(cas[2]);

    });

  }

});

describe('Money.isGreaterThanOrEqual', () => {

  const cases:any = [
    ['1', '2', false],
    ['-10', '-20', true],
    ['1', 1, true],
    ['-100', '100', false],
    ['-0', 0, true],
    ['1.00000001', '1.00000002', false],
    ['1.00000003', '1.00000002', true],
  ];

  for (const cas of cases) {

    it(`${cas[0]}.isGreaterThanOrEqual(${cas[1]}) === true`, () => {

      const x = new Money(cas[0], 'AUD');
      expect(x.isGreaterThanOrEqual(cas[1])).to.equal(cas[2]);

    });

  }

});
