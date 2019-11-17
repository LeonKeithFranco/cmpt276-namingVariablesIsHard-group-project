//server port
const PORT = 5000;

//get elements from the HTML page
var numDrawings = 6;

var drawings = [];
var svgList = [];

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
	socket.emit('clientRequestDrawing', {
		category: "cat", 
		id: 40323
	});
});

socket.on('serverSendDrawing', (convertedDrawing) => {
	console.log(`${convertedDrawing}`);
	const {word, svg} = convertedDrawing;
	drawings[0].innerHTML = svg;
});








