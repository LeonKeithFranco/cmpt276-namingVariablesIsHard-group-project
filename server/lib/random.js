const _ = require('lodash');

module.exports = {
    /*
	Pre-condition: Requires an array size (integer) and upperbound (integer)
	Post-condition: Will return an array of length [size] of random, unique numbers between 0 (inclusive) and [upperbound] (exclusive)
	Additional notes: code credit to https://stackoverflow.com/questions/2380019/generate-unique-random-numbers-between-1-and-100
*/
    randomArray: function (upperbound, size) {
        let arr = [];
        while (arr.length < size) {
            let r = _.random(upperbound - 1);
            if (arr.indexOf(r) === -1) arr.push(r);
        }
        return arr;
    },

    /*
        Pre-condition: Requires an array
        Post-condition: Will return a shuffled array using the Fisher-Yates method: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        Additional notes: specific function implementation credit to https://javascript.info/task/shuffle
    */
    shuffle: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}