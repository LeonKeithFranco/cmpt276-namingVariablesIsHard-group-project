const socket = io.connect(window.location.origin);

const drawingDivs = $(".drawing");

let svgArr = [];
let categoryArr = [];
let category = "";
let drawingCount = 0;
let allDrawingsLoaded = false;

$(document).ready(() => {
  gameEngine.displayScore();
  fillDrawingDivs();
});

function fillDrawingDivs() {
  svgArr = [];
  categoryArr = [];
  category = "";
  drawingCount = 0;
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

}

gameEngine.setSubmitButtonClickEvent(() => {
  const playerGuess = gameEngine.getUserInput();

  if (gameEngine.willContinueGame() && playerGuess) {
    const answer = gameEngine.getCategory();

    // assert.isString(answer);
    // assert.isNotEmpty(answer);

    if (playerGuess === answer) {
      gameEngine.incrementScore()
      gameEngine.displayScore();
      gameEngine.playRight();
      gameEngine.resetUserInput();
      gameEngine.fillDrawingDivs();
    } else {
      gameEngine.playWrong();
      gameEngine.stopGame();
      gameEngine.updateHighScore();
      gameEngine.displayGameOverScreen();
    }
  }
});

gameEngine.setPlayAgainButtonClickEvent(() => {
  if (allDrawingsLoaded) {
    gameEngine.restartGame();
    gameEngine.resetScore();
    gameEngine.displayScore();
    gameEngine.resetUserInput();
    fillDrawingDivs();
  }
});
