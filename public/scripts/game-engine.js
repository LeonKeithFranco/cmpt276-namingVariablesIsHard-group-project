//server port
const PORT = 5000;

//get elements from the HTML page
var drawing1 = document.getElementById('drawing1');
	guessButton = document.getElementById('submitGuessButton');

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
	drawing1.innerHTML = svg;
});








