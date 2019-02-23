import { expect } from 'chai';
import { divide, Round } from '../src/util';

describe('divide', () => {

  const tests = [
    [7n, 2n, 4n],
    [5n, 2n, 2n],
    [-7n, 2n, -4n],
    [-5n, 2n, -2n],
  ];

  for(const test of tests) {

    it(`${test[0]} / ${test[1]} = ${test[2]}`, () => {

      expect(
        divide(test[0], test[1], Round.HALF_TO_EVEN),
      ).to.equal(test[2]);

    });

  }

});
