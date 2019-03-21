import { expect } from 'chai';
import { bigintToFixed, Round, PRECISION } from '../src/util';

describe('bigintToFixed', () => {
  
  const P = PRECISION;

  const tests = [
    [                     1n, 0, '0'],
    [   1n * (10n ** P),      0, '1'],
    [   1n * (10n ** (P-1n)), 0, '0'],
    [   1n * (10n ** (P-1n)), 1, '0.1'],
    [   1n * (10n ** (P-2n)), 2, '0.01'],
    [   4n * (10n ** (P-3n)), 2, '0.00'],
    [   5n * (10n ** (P-3n)), 2, '0.00'],
    [   6n * (10n ** (P-3n)), 2, '0.01'],
    [  99n * (10n ** (P-2n)), 2, '0.99'],
    [ 995n * (10n ** (P-3n)), 2, '1.00'],
    [                    -1n, 0, '0'],
    [       -1n * (10n ** P), 0, '-1'],
    [  -1n * (10n ** (P-1n)), 0, '0'],
    [  -1n * (10n ** (P-1n)), 1, '-0.1'],
    [  -1n * (10n ** (P-2n)), 2, '-0.01'],
    [  -4n * (10n ** (P-3n)), 2, '-0.00'],
    [  -5n * (10n ** (P-3n)), 2, '-0.00'],
    [  -6n * (10n ** (P-3n)), 2, '-0.01'],
    [ -99n * (10n ** (P-2n)), 2, '-0.99'],
    [-995n * (10n ** (P-3n)), 2, '-1.00'],
  ];

  for(const test of tests) {
    it(`bigintToFixed(${test[0]},${test[1]}) === ${test[2]}`, () => {

      const result = bigintToFixed(<bigint>test[0], <number>test[1], Round.BANKERS);
      expect(result).to.equal(test[2]);

    });
  }

});
