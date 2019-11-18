//get elements from the HTML page
let numDrawings = 6; //maximum drawings per set

const drawings = $(".drawing"); //holds html div elements to place drawings
var svgList = []; //holds svgs of drawings from server, can place each element directly in a div's innerHTML

var maxSize = 0;
var category = "";

let	guessButton = document.getElementById('submitGuessButton');

//connect to server socket
const socket = io.connect(window.location.origin);

// //add event to the Guess button
// submitGuessButton.addEventListener('click', function() {
// 	//you can use this to test and debug some of the functions I've written if you want, note console.log here will output to the browser console.
// });

//whenever client receives a drawing from the server, it adds it to the svgList
socket.on('serverSendDrawing', (convertedDrawing) => {
	console.log(`${convertedDrawing}`);

	const numberOfDrawings = svgList.length
	const {word, svg} = convertedDrawing;
	svgList.push(svg);

	drawings[numDrawings] = svgList[numDrawings];
});

//whenever client recieves a category size, it saves the number in maxSize
socket.on('serverSendCategorySize', (size) => {
	maxSize = size;
});

//whenever client receives a category name, it saves the name in category
socket.on('serverSendCategoryName', (name) => {
	category = name;
});

socket.on('serverSendRandomCategoryName', (name) => {
	category = name;
});

//random functions
/*
	Pre-condition: Requires an upperbound (integer)
	Post-condition: Will return an integer between 0 (inclusive) and the upperbound (exclusive)
*/
function randomRange (upperbound) {
	return Math.floor(Math.random() * upperbound);
};

/*
	Pre-condition: Requires an array size (integer) and upperbound (integer)
	Post-condition: Will return an array of length [size] of random, unique numbers between 0 (inclusive) and [upperbound] (exclusive)
	Additional notes: code credit to https://stackoverflow.com/questions/2380019/generate-unique-random-numbers-between-1-and-100
*/
function randomArray (upperbound, size) {
	let arr = [];
	while(arr.length < size){
	    let r = randomRange(upperbound);
	    if(arr.indexOf(r) === -1) arr.push(r);
	}
	return arr;
};

/*
	Pre-condition: Requires an array
	Post-condition: Will return a shuffled array using the Fisher-Yates method: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	Additional notes: specific function implementation credit to https://javascript.info/task/shuffle
*/
function shuffle (array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
    	[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};