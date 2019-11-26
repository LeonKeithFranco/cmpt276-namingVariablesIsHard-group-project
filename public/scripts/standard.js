const socket = io.connect(window.location.origin);

const drawingDivs = $(".drawing");
const input = $('#wordInput');
const scoreDisplay = $('#score');
const submitGuessBtn = $('#submitGuessButton');
const playAgainBtn = $('#playAgainButton');
const hintDisplay = $('#hint');

let svgArr = [];
let category = "";
let drawingCount = 0;
let playerScore = 0;
let continueGame = true;
let allDrawingsLoaded = false;

socket.on('serverSendRandomCategoryName', (cat) => {
  category = cat;
  hintDisplay.text(`Hint: ${category.replace(/\S/g, "-")}`);
  socket.emit('clientRequestCountFromCategory', {
    category: category,
    count: drawingDivs.length
  });
});

socket.on('serverSendDrawing', (drawingData) => {
  const { word, svg } = drawingData;
  svgArr.push(svg);
  $(drawingDivs[drawingCount]).html(svgArr[drawingCount]);
  drawingCount++;
  allDrawingsLoaded = drawingCount === drawingDivs.length;
});

function fillDrawingDivs() {
  svgArr = [];
  category = "";
  drawingCount = 0;
  allDrawingsLoaded = false;

  socket.emit('clientRequestRandomCategoryName');
}

$(document).ready(() => {
  scoreDisplay.text(`Score: ${playerScore}`);
  fillDrawingDivs();
});

submitGuessBtn.click(() => {
  const playerGuess = input.val().trim().toLowerCase();

  if (continueGame && playerGuess) {
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
  if (allDrawingsLoaded) {
    console.log('play again clicked')
    continueGame = true;

    playerScore = 0;

    scoreDisplay.text(`Score: ${playerScore}`);
    input.val('');

    fillDrawingDivs();
  }
});
