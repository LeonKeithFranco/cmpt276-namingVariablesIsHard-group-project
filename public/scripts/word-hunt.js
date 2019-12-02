const socket = io.connect(window.location.origin);

const drawingDivs = $(".drawing");
const scoreDisplay = $('#score');
const categoryDiv = $("#category");
const playAgainBtn = $('#playAgainButton');
const rightSound = new Audio('../../assets/audio/right.mp3');
const wrongSound = new Audio('../../assets/audio/wrong.mp3');

let svgArr = [];
let categoryArr = [];
let category = "";
let correctIndex;
let drawingCount = 0;
let allDrawingsLoaded = false;

$(document).ready(() => {
  gameEngine.displayScore();
  startGame();
});

function startGame() {
  playerScore = 0;
  continueGame = true;
  getRound();
}

function getRound() {
  scoreDisplay.text(`Score: ${playerScore}`);
  svgArr = [];
  categoryArr = [];
  category = "";
  drawingCount = 0;
  continueGame = true;
  allDrawingsLoaded = false;

  socket.emit('clientRequestRandomCategoryNames', drawingDivs.length);
}

socket.on('serverSendRandomCategoryName', (cat) => {
  socket.emit('clientRequestFromCategory', cat);
});

socket.on('serverSendDrawing', (drawingData) => {
  const { word, svg } = drawingData;

  // assert.isNotEmpty(word);
  // assert.isString(word);

  // assert.isNotEmpty(svg);
  // assert.isString(svg);
  // assert.match(svg, /svg/);

  svgArr.push(svg);
  categoryArr.push(word);
  $(drawingDivs[drawingCount]).html(svgArr[drawingCount]);
  drawingCount++;
  allDrawingsLoaded = drawingCount === drawingDivs.length;

  if(allDrawingsLoaded) {
    setCorrectCategory();
  }
});

function setCorrectCategory() {
  correctIndex = randomRange(drawingDivs.length);
  category = categoryArr[correctIndex];

  categoryDiv.text(`Category: ${category}`);

  for (let i = 0; i < svgArr.length; i++) {
    $(drawingDivs[i]).html(svgArr[i]);
    $(drawingDivs[i]).on('click', function () {
      select(i);
    });
  }
}

function select(index) {
  if (continueGame && allDrawingsLoaded) {

    if (index === correctIndex) {
      playerScore++;

      rightSound.play();

      getRound();
    } else {
      wrongSound.play();

      continueGame = false;

      let alertString = "";
      alertString += `Game over!\n`;
      alertString += `It was picture ${correctIndex + 1}.\n\n`;
      alertString += `Score: ${playerScore}\n\n`;
      alertString += `Click "Play Again" to start a new game!`;

      alert(alertString);
    }
  }
}

function randomRange(upperbound) {
  // assert.isNumber(upperbound);

  return Math.floor(Math.random() * upperbound);
}

playAgainBtn.click(() => {
  if (allDrawingsLoaded) {
    startGame();
  }
});
