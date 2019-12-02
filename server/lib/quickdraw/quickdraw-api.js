const request = require('request');
const requestP = require('request-promise-native');
const _ = require('lodash');
const categories = require('./categories');
const qdsr = require('quickdraw-svg-render');

const API_KEYS = [
  'AIzaSyC0U3yLy_m6u7aOMi9YJL2w1vWG4oI5mj0',
  'AIzaSyC5osDYfGz4jZvEw_6WdGFuQ1ZYDE-P7VM',
  'AIzaSyBasoPrgP5G0T08HZ41H4hc4_FiCVf61qA',
  'AIzaSyCwDo9OEKiIHAWQEmezXK--aL_vh7EQKp0',
  'AIzaSyDQUbF6AH32qjU7Ntuf2GMMxtigJx6tZgM',
  'AIzaSyC7U2zZFl1don5JA6VtEfdbumokwZj8FLo',
  'AIzaSyDxca15NbXtgHVk2GLTNybPt_C010F3CC0'
];
let apiKey = API_KEYS[0];
let counter = 0;

module.exports = {
  /*
    Pre-condition: Requires a callback as input
    Post-condition: Will get a random Quick, Draw! drawing from Google's web API, convert the returned drawing into a
                    JSON object, then apply the callback to the drawing JSON object 
  */
  getRandomDrawing: function (callback) {
    const categoryIndex = _.random(categories.length - 1);
    const category = categories[categoryIndex];
    const URL = `https://quickdrawfiles.appspot.com/drawing/${category}?&key=${apiKey}&isAnimated=false&format=json`;
    counter = ++counter % API_KEYS.length;
    apiKey = API_KEYS[counter];

    request(URL, (error, response, body) => {
      if (error) {
        console.error(error);
      }

      try {
        const parsedBody = JSON.parse(body);

        if (parsedBody.code !== 8) {
          setTimeout(callback, 0, parsedBody);
        } else {
          this.getRandomDrawing(callback);
        }
      }
      catch (err) {
        console.error(err);
        this.getRandomDrawing(callback);
      }
    });
  },

  // same as above but uses async/await
  getRandomDrawingPromise: async function () {
    const categoryIndex = _.random(categories.length - 1);
    const category = categories[categoryIndex];
    const URL = `https://quickdrawfiles.appspot.com/drawing/${category}?&key=${apiKey}&isAnimated=false&format=json`;

    let parsedResult;
    let code;

    do {
      try {
        const result = await requestP(URL);
        parsedResult = JSON.parse(result);
        code = parsedResult.code;
      }
      catch (err) {
        console.error(err);

        code = 8;
      }
      finally {
        counter = ++counter % API_KEYS.length;
        apiKey = API_KEYS[counter];
      }
    } while (code === 8);

    return parsedResult;
  },

  /*
    Pre-condition: Requires a category name (string), a drawing id (number) and a callback as input
    Post-condition: Will get a specific Quick, Draw! drawing from Google's web API, convert the returned drawing into a
                    JSON object, then apply the callback to the drawing JSON object 
  */
  getDrawing: function (category, id, callback) {
    const URL = `https://quickdrawfiles.appspot.com/drawing/${category}?id=${id}&key=${apiKey}&isAnimated=false&format=json`;
    counter = ++counter % API_KEYS.length;
    apiKey = API_KEYS[counter];

    request(URL, (error, response, body) => {
      if (error) {
        console.error(error);
      }

      try {
        const parsedBody = JSON.parse(body);

        if (parsedBody.code !== 8) {
          setTimeout(callback, 0, parsedBody, body);
        } else {
          this.getDrawing(category, id, callback);
        }
      }
      catch (err) {
        console.log(err)
        this.getDrawing(category, id, callback);
      }
    });
  },

  // same as above but uses async/await
  getDrawingPromise: async function (category, id) {
    const URL = `https://quickdrawfiles.appspot.com/drawing/${category}?id=${id}&key=${apiKey}&isAnimated=false&format=json`;

    let parsedResult;
    let code;
    let finished;

    do {
      try {
        const result = await requestP(URL);
        parsedResult = JSON.parse(result);
        code = parsedResult.code;
        finished = { parsedDrawing: parsedResult, rawDrawing: result };
      }
      catch (err) {
        console.error(err);

        code = 8;
      }
      finally {
        counter = ++counter % API_KEYS.length;
        apiKey = API_KEYS[counter];
      }
    } while (code === 8);

    return finished;
  },

  /*
    Pre-condition: Requires an integer between 0 and 344 (inclusive) as input
    Post-condition: Will return a category name from the corresponding given index
  */
  getCategory: function (index) {
    if (index >= 0 && index < categories.length) return categories[index];
  },

  /*
    Pre-condition: None
    Post-condition: Will return a random category name
  */
  getRandomCategory: function () {
    return categories[_.random(categories.length - 1)];
  },

  /*
    Pre-condition: Requires a category name as a string and a callback as input
    Post-condition: Will get the number of random Quick, Draw! drawings of the given category from Google's web API, convert the returned number into a JSON object, then apply the callback to the number
    Additional notes: used to obtain an upper bound for generating random drawing indexes
  */
  getCategorySize: function (category, callback) {
    const URL = `https://quickdrawfiles.appspot.com/drawing/${category}/count?key=${apiKey}`;

    request(URL, (error, response, body) => {
      if (error) {
        console.error(error);
      }
      try {
        setTimeout(callback, 0, JSON.parse(body));
      } catch (error) {
        console.error(error);
        this.getCategorySize(category, callback);
      }
    });
  },

  // same as above but uses async/await
  getCategorySizePromise: async function (category) {
    const URL = `https://quickdrawfiles.appspot.com/drawing/${category}/count?key=${apiKey}`;

    let parsedResult;

    do {
      try {
        const result = await requestP(URL);
        parsedResult = JSON.parse(result);
      }
      catch (err) {
        console.error(err);

        parsedResult = undefined;
      }
    } while (!parsedResult);

    return parsedResult;
  },

  /*
    Pre-Condition: Requires a Quick, Draw! object and a callback
    Post-Condition: Applies the callback to an object which contains the related word and an HTML svg element as a string
  */
  convertDrawing: function (drawing, callback) {
    let svgArray = [];
    try {
      svgArray = qdsr(drawing.drawing, true);
      const svgHTMLElem = svgArray.reduce((currentVal, nextVal) => {
        return currentVal + nextVal;
      });

      setTimeout(callback, 0, { word: drawing.word, svg: svgHTMLElem });

    } catch (error) {
      console.error(error);
    }
  },

  // same as above but uses async/await
  convertDrawingPromise: async function (drawing) {
    let svgArray = [];

    try {
      svgArray = qdsr(drawing.drawing, true);
      const svgHTMLElem = svgArray.reduce((currentVal, nextVal) => {
        return currentVal + nextVal;
      });

      return { word: drawing.word, svg: svgHTMLElem };
    } catch (err) {
      console.error(err);
    }
  }
};
