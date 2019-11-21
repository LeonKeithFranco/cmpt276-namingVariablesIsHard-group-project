const assert = require('chai').assert;
const random = require('../server/lib/random');

describe('random', () => {
  describe('randomArray()', () => {
    const size = 5;
    const upperBound = 10;
    const arr = random.randomArray(upperBound, size);

    it(`Should return and array of size ${size}`, () => {
      assert.strictEqual(arr.length, size);
    });

    it('Should return an array of all numbers', () => {
      arr.forEach(elem => assert.isNumber(elem));
    });

    it(`Should return an array filled with numbers less than ${upperBound}`, () => {
      arr.forEach(elem => assert.isBelow(elem, upperBound));
    });

    it(`Should return an array filled with numbers equal to or grater than 0`, () => {
      arr.forEach(elem => assert.isAtLeast(elem, 0));
    });

    it('Should return an array of numbers that are unique', () => {
      for (let i = 0; i < size; i++) {
        for (let j = i + 1; j < size; j++) {
          assert.notStrictEqual(arr[i], arr[j]);
        }
      }
    });
  });
  
});