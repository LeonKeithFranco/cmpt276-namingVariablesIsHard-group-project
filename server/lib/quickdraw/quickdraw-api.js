const request = require('request');
const _ = require('lodash');
const categories = require('./categories');

const API_KEY = 'AIzaSyBasoPrgP5G0T08HZ41H4hc4_FiCVf61qA';

module.exports = {
  /*
    Pre-condition: Requires a callback as input
    Post-condition: Will get a random Quick, Draw! drawing from Google's web API, convert the returned drawing into a
                    JSON object, then apply the callback to the drawing JSON object 
  */
  getRandomDrawing: function (callback) {
    const categoryIndex = _.random(categories.length - 1);
    const category = categories[categoryIndex];
    const URL = `https://quickdrawfiles.appspot.com/drawing/${category}?&key=${API_KEY}&isAnimated=false&format=json`;

    request(URL, (error, response, body) => {
      if (error) {
        throw error;
      }

      setTimeout(callback, 0, JSON.parse(body));
    });
  },

  /*
    Pre-condition: Requires a category name (string), a drawing id (number) and a callback as input
    Post-condition: Will get a specific Quick, Draw! drawing from Google's web API, convert the returned drawing into a
                    JSON object, then apply the callback to the drawing JSON object 
  */
  getDrawing: function (category, id, callback) {
    const URL = `https://quickdrawfiles.appspot.com/drawing/${category}?id=${id}&key=${API_KEY}&isAnimated=false&format=json`;

    request(URL, (error, response, body) => {
      if (error) {
        throw error;
      }

      setTimeout(callback, 0, JSON.parse(body));
    });
  },

  /*
    Pre-condition: Requires an integer between 0 and 344 (inclusive) as input
    Post-condition: Will return a category name from the corresponding given index
  */
  getCategory: function (index) {
    if (index >= 0 && index < categories.length) return categories[index];
  },

  /*
    Pre-condition: Requires a category name as a string and a callback as input
    Post-condition: Will get the number of random Quick, Draw! drawings of the given category from Google's web API, convert the returned number into a JSON object, then apply the callback to the number
    Additional notes: used to obtain an upper bound for generating random drawing indexes
  */
  getCategorySize: function (category, callback) {
    const URL = `https://quickdrawfiles.appspot.com/drawing/${category}/count?key=${API_KEY}`;

    request(URL, (error, response, body) => {
      if (error) {
        throw error;
      }
      setTimeout(callback, 0, JSON.parse(body));
    });
  }
};
