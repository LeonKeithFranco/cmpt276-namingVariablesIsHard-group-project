const socket = io.connect(window.location.origin);

const drawingDiv = $('#drawing');
const scoreDisplay = $('#score');
const roundDisplay = $('#round');
const categoryDisplay = $('#category');
const playAgainBtn = $('#playAgainButton');
const passBtn = $('#passButton');
const failBtn = $('#failButton');
const rightSound = new Audio('../../assets/audio/right.mp3');
const wrongSound = new Audio('../../assets/audio/wrong.mp3');

let category = "";
let playerScore = 0;
let round = 0;
let continueGame = true;
let drawingLoaded = false;
let drawingPassed = false;

$(document).ready(() => {
    startGame();
});

function startGame() {
    playerScore = 0;
    round = 0;
    nextRound();
}

function nextRound() {
    scoreDisplay.text(`Score: ${playerScore}`);
    if(round < 10) {
        round++;
        roundDisplay.text(`Round: ${round}`);
        getRound();
    } else {
        gameFinished();
    }
}

function getRound() {
    category = "";
    drawingLoaded = false;
    drawingPassed = Math.random() >= 0.5;
    socket.emit('clientRequestRandomCategoryName', 1, '', drawingPassed);
}

socket.on('serverSendRandomCategoryName', (cat) => {
    // assert.isNotEmpty(cat);
    // assert.isString(cat);

    category = cat;
    categoryDisplay.html(category);

    socket.emit('clientRequestCountFromCategory', {
        category: category,
        count: 1,
        recognized: drawingPassed
    });
});

socket.on(('serverSendDrawing'), (drawingData) => {
    const { word, svg } = drawingData;

    // assert.isNotEmpty(word);
    // assert.isString(word);

    // assert.isNotEmpty(svg);
    // assert.isString(svg);
    // assert.match(svg, /svg/);

    drawingDiv.html(svg);
    drawingLoaded = true;
});

passBtn.click(() => {
    submitGuess(true);
});

failBtn.click(() => {
    submitGuess(false);
});

function submitGuess(selectedPassed) {
    // assert.isBoolean(selectedPassed);

    if(drawingLoaded && continueGame) {
        if(selectedPassed === drawingPassed) {
            playerScore++;
            rightSound.play();
        } else {
            wrongSound.play();
        }

        nextRound();
    }
}

function gameFinished() {
    continueGame = false;
    alert(`Game finished!\n\nScore: ${playerScore}\n\nClick "Play Again" to start a new game!`);
}

playAgainBtn.click(() => {
    if(drawingLoaded) {
        continueGame = true;
        startGame();
    }
});
