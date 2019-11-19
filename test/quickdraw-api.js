const assert = require('chai').assert;
const quickdraw = require('../server/lib/quickdraw/quickdraw-api');

describe('quickdraw-api', () => {
  describe('getRandomDrawing()', () => {
    it('Should return quickdraw JSON object', (asyncTestDone) => {
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
});