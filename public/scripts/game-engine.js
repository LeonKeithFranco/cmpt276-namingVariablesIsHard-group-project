//server port
const PORT = 5000;

//get elements from the HTML page
var numDrawings = 6; //maximum drawings per set

var drawings = []; //holds html div elements to place drawings
var svgList = []; //holds svgs of drawings from server, can place each element directly in a div's innerHTML

var maxSize = 0;
var category = "";

for (var i = 0; i < numDrawings; i++) {
	if (document.getElementById(`drawing${i+1}`) !== null) {
		drawings.push(document.getElementById(`drawing${i+1}`));
	}
}

var	guessButton = document.getElementById('submitGuessButton');

//connect to server socket
const socket = io.connect(`http://localhost:${PORT}`);

//add event to the Guess button
submitGuessButton.addEventListener('click', function() {
	
});

//whenever client receives a drawing from the server, it adds it to the svgList
socket.on('serverSendDrawing', (convertedDrawing) => {
	console.log(`${convertedDrawing}`);
	const {word, svg} = convertedDrawing;
	svgList.push(svg);
});

//whenever client recieves a category size, it saves the number in maxSize
socket.on('serverSendCategorySize', (size) => {
	maxSize = size;
});

//whenever client receives a category name, it saves the name in category
socket.on('serverSendCategoryName', (name) => {
	category = name;
})







