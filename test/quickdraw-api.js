const assert = require('chai').assert;
const quickdraw = require('../server/lib/quickdraw/quickdraw-api');

describe('quickdraw-api', () => {
  describe('getRandomDrawing()', () => {
    it('Should return a quickdraw JSON object', (asyncTestDone) => {
      quickdraw.getRandomDrawing((drawingObj) => {
        assert.isObject(drawingObj);
        assert.property(drawingObj, 'key_id');
        assert.property(drawingObj, 'word');
        assert.property(drawingObj, 'recognized');
        assert.property(drawingObj, 'timestamp');
        assert.property(drawingObj, 'countrycode');
        assert.property(drawingObj, 'drawing');

        asyncTestDone();
      });
    });
  });

  describe('getDrawing()', () => {
    const category = 'cat'
    const drawingId = 0;

    it('Should return a quickdraw JSON object', (asyncTestDone) => {
      quickdraw.getDrawing(category, drawingId, (drawingObj) => {
        assert.isObject(drawingObj);
        assert.property(drawingObj, 'key_id');
        assert.property(drawingObj, 'word');
        assert.property(drawingObj, 'recognized');
        assert.property(drawingObj, 'timestamp');
        assert.property(drawingObj, 'countrycode');
        assert.property(drawingObj, 'drawing');

        asyncTestDone();
      });
    });

    it(`Should return a quickdraw drawing of category "${category}"`, (asyncTestDone) => {
      quickdraw.getDrawing(category, drawingId, (drawingObj) => {
        assert.propertyVal(drawingObj, 'word', category);
  
        asyncTestDone();
      });
    });
  });

  describe('getCategory()', () => {
    let index = 0;
    let expected = 'aircraft carrier';

    it(`Index of ${index} should return category of "${expected}"`, () => {
      const result = quickdraw.getCategory(index);

      assert.isString(result);
      assert.strictEqual(result, expected);
    });

    index = 344;
    expected = 'zigzag';

    it(`Index of ${index} should return category of "${expected}"`, () => {
      const result = quickdraw.getCategory(index);

      assert.isString(result);
      assert.strictEqual(result, expected);
    });
  });

  describe('getRandomCategory()', () => {
    it('Should return a random category', () => {
      const result = quickdraw.getRandomCategory();

      assert.isString(result);
    });
  });

  describe('getCategorySize()', () => {
    it('Should return a positive number for some category', (asyncTestDone) => {
      quickdraw.getCategorySize('cat', (categorySize) => {
        assert.operator(categorySize, '>', 0);

        asyncTestDone();
      });
    })
  });

});