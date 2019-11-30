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

  describe('getRandomDrawingPromise()', () => {
    it('Should return a quickdraw JSON object', async () => {
      const drawingObj = await quickdraw.getRandomDrawingPromise();

      assert.isObject(drawingObj);
      assert.property(drawingObj, 'key_id');
      assert.property(drawingObj, 'word');
      assert.property(drawingObj, 'recognized');
      assert.property(drawingObj, 'timestamp');
      assert.property(drawingObj, 'countrycode');
      assert.property(drawingObj, 'drawing');
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

  describe('getDrawingPromise()', () => {
    const category = 'angel'
    const drawingId = 1;

    it('Should return a quickdraw JSON object', async () => {
      const { parsedDrawing, rawDrawing } = await quickdraw.getDrawingPromise(category, drawingId);

      assert.isObject(parsedDrawing);
      assert.property(parsedDrawing, 'key_id');
      assert.property(parsedDrawing, 'word');
      assert.property(parsedDrawing, 'recognized');
      assert.property(parsedDrawing, 'timestamp');
      assert.property(parsedDrawing, 'countrycode');
      assert.property(parsedDrawing, 'drawing');
    });

    it(`Should return a quickdraw drawing of category "${category}"`, async () => {
      const { parsedDrawing, rawDrawing } = await quickdraw.getDrawingPromise(category, drawingId);

      assert.propertyVal(parsedDrawing, 'word', category);
    });

    it(`Should return an unparsed string of a quickdraw drawing of category "${category}"`, async () => {
      const { parsedDrawing, rawDrawing } = await quickdraw.getDrawingPromise(category, drawingId);

      assert.isString(rawDrawing);
      assert.match(rawDrawing, /key_id/);
      assert.match(rawDrawing, /word/);
      assert.match(rawDrawing, /recognized/);
      assert.match(rawDrawing, /timestamp/);
      assert.match(rawDrawing, /countrycode/);
      assert.match(rawDrawing, /drawing/);
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

  describe('convertDrawing()', () => {
    const category = 'sock';
    const drawingId = 0;

    it(`Should return a word that matches category "${category}"`, (asyncTestDone) => {
      quickdraw.getDrawing(category, drawingId, (drawing) => {
        quickdraw.convertDrawing(drawing, (convertedDrawing) => {
          const { word, svg } = convertedDrawing;

          assert.isString(word);
          assert.strictEqual(word, category);

          asyncTestDone();
        });
      });
    });

    it('Should return a svg HTML element as a string', (asyncTestDone) => {
      quickdraw.getRandomDrawing((drawing) => {
        quickdraw.convertDrawing(drawing, (convertedDrawing) => {
          const { word, svg } = convertedDrawing;

          assert.isString(svg);
          assert.match(svg, /svg/);

          asyncTestDone();
        });
      });
    });
  });

});