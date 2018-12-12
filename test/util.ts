import { expect } from 'chai';
import { nearestEvenDivide } from '../src/util';

describe('nearestEvenDivide', () => {

  const tests = [
    [7n, 2n, 4n],
    [5n, 2n, 2n],
    [-7n, 2n, -4n],
    [-5n, 2n, -2n],
  ];

  for(const test of tests) {

    it(`${test[0]} / ${test[1]} = ${test[2]}`, () => {

      expect(nearestEvenDivide(test[0], test[1])).to.equal(test[2]);

    });

  }

});
