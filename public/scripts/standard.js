$(document).ready(() => {
  gameEngine.displayScore();
  gameEngine.fillDrawingDivs();
});

gameEngine.setSubmitButtonClickEvent(() => {
  const playerGuess = gameEngine.getUserInput();

  if (gameEngine.willContinueGame() && playerGuess) {
    console.log('here');
    const answer = gameEngine.getCategory();

    if (playerGuess === answer) {
      gameEngine.incrementScore()
      gameEngine.displayScore();
      gameEngine.resetUserInput();
      gameEngine.fillDrawingDivs();
    } else {
      gameEngine.stopGame();
      gameEngine.updateHighScore();
      gameEngine.displayGameOverScreen();
    }
  }
});

gameEngine.setPlayAgainButtonClickEvent(() => {
  if (gameEngine.isAllDrawingsLoaded()) {
    gameEngine.restartGame();
    gameEngine.resetScore();
    gameEngine.displayScore();
    gameEngine.resetUserInput();
    gameEngine.fillDrawingDivs();
  }
});
