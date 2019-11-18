const socket = io.connect(window.location.origin);

const drawingDivs = $(".drawing");
const input = $('#wordInput');
const scoreDisplay = $('#score');
const submitGuessBtn = $('#submitGuessButton');
const playAgainBtn = $('#playAgainButton');

let svgArr = [];
let category = "";
let drawingCount = 0;
let playerScore = 0;
let continueGame = true;

socket.on('serverSendRandomCategoryName', (cat) => {
  category = cat;
  socket.emit('clientRequestCategorySize', category);
});

socket.on('serverSendCategorySize', (categorySize) => {
  const drawingIds = randomArray(categorySize, drawingDivs.length);

  $('.drawing').each(function (index) {
    socket.emit('clientRequestDrawing', { category: category, id: drawingIds[index] });
  });
});

socket.on('serverSendDrawing', (drawingData) => {
  const { word, svg } = drawingData;
  svgArr.push(svg);
  $(drawingDivs[drawingCount]).html(svgArr[drawingCount]);
  drawingCount++;
});

function fillDrawingDivs() {
  svgArr = [];
  category = "";
  drawingCount = 0;

  socket.emit('clientRequestRandomCategoryName');
}

function randomArray(upperbound, size) {
  let arr = [];
  while (arr.length < size) {
    let r = randomRange(upperbound);
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
};

function randomRange(upperbound) {
  return Math.floor(Math.random() * upperbound);
};

$(document).ready(() => {
  scoreDisplay.text(`Score: ${playerScore}`);
  fillDrawingDivs();
});

submitGuessBtn.click(() => {
  if (continueGame) {
    const playerGuess = input.val().trim().toLowerCase();
    const answer = category.toLowerCase();

    if (playerGuess === answer) {
      scoreDisplay.text(`Score: ${++playerScore}`);
      input.val('');

      fillDrawingDivs();
    } else {
      continueGame = false;

      alert(`Game over!\nThe word was "${category}".\n\nScore: ${playerScore}\n\nClick "Play Again" to start a new game!`);
    }
  }
});

input.keypress(function (e) {
  let key = e.which;

  if (key == 13) { // hitting enter key
    submitGuessBtn.click();
  }
});

playAgainBtn.click(() => {
  console.log('play again clicked')
  continueGame = true;

  playerScore = 0;

  scoreDisplay.text(`Score: ${playerScore}`);
  input.val('');

  fillDrawingDivs();
});
