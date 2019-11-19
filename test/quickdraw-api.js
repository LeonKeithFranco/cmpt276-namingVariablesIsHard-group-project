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


});