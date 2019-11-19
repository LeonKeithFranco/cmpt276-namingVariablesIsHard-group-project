const socket = io.connect(window.location.origin);

const drawingDivs = $(".drawing");
const input = $('#wordInput');
const scoreDisplay = $('#score');
const timeDisplay = $('#time');
const submitGuessBtn = $('#submitGuessButton');
const playAgainBtn = $('#playAgainButton');
const hintDisplay = $('#hint');

let svgArr = [];
let category = "";
let drawingCount = 0;
let playerScore = 0;
let continueGame = true;
let allDrawingsLoaded = false;

let start = Date.now();
let checkTimer;
let checkTime = 1000;
let time;
let maxTime = 60;

socket.on('serverSendRandomCategoryName', (cat) => {
    category = cat;
    hintDisplay.text(`Hint: ${category.replace(/\S/g, "-")}`);
    socket.emit('clientRequestCategorySize', category);
});

socket.on('serverSendCategorySize', (categorySize) => {
    const drawingIds = randomArray(categorySize, drawingDivs.length);

    drawingDivs.each(function (index) {
        socket.emit('clientRequestDrawing', { category: category, id: drawingIds[index] });
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
   checkTimer = setInterval(function () {
        updateTime();
    }, checkTime);
});

function updateTime() {
    time = maxTime - Math.floor((Date.now() - start)/1000);
    console.log((Date.now() - start)/1000);
    timeDisplay.text(`Time: ${time}`);

    
}

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