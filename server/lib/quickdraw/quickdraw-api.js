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
  }
};
