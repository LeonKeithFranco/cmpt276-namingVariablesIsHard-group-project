const timeDisplay = $('#time');

let start = Date.now();
let checkTimer;
let checkTime = 1000;
let time;
let maxTime;

$(document).ready(() => {
    if (difficulty === 'easy') {
        maxTime = 60;
    } else if (difficulty === 'normal') {
        maxTime = 50;
    } else if (difficulty === 'hard') {
        maxTime = 30;
    }

    gameEngine.displayScore();
    gameEngine.fillDrawingDivs();

    checkTimer = setInterval(function () {
        updateTime();
    }, checkTime);
});

function updateTime() {
    if (gameEngine.willContinueGame()) {
        time = maxTime - Math.floor((Date.now() - start) / 1000);
        timeDisplay.text(`Time: ${time}`);

        if (time < 0) {
            time = 0;
            timeDisplay.text(`Time: ${time}`);

            gameEngine.stopGame();
            gameEngine.updateHighScore();
            gameEngine.displayGameOverScreen();
        }
    }
}

gameEngine.setSubmitButtonClickEvent(() => {
    const playerGuess = gameEngine.getUserInput();

    if (gameEngine.willContinueGame() && playerGuess) {
        const answer = gameEngine.getCategory();

        // assert.isNotEmpty(answer);
        // assert.isString(answer);

        if (playerGuess === answer) {
            gameEngine.incrementScore();
            gameEngine.displayScore();
            gameEngine.resetUserInput();

            flash.green(gameEngine.getInputHtmlElement());

            gameEngine.fillDrawingDivs();
        } else {
            gameEngine.resetUserInput();
            gameEngine.revealHint();

            flash.red(gameEngine.getInputHtmlElement());
        }
    }
});

gameEngine.setPlayAgainButtonClickEvent(() => {
    if (gameEngine.isAllDrawingsLoaded()) {
        gameEngine.restartGame();
        gameEngine.resetScore();
        gameEngine.displayScore();
        gameEngine.resetUserInput();

        start = Date.now();

        gameEngine.fillDrawingDivs();
    }
});