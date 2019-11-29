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
let maxTime;

socket.on('serverSendRandomCategoryName', (cat) => {
    category = cat;
    hintDisplay.text(`${category.replace(/\S/g, "-")}`);
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

    socket.emit('clientRequestRandomCategoryName', drawingDivs.length);
}

$(document).ready(() => {
    if (difficulty === 'easy') {
        maxTime = 60;
    } else if (difficulty === 'normal') {
        maxTime = 50;
    } else if (difficulty === 'hard') {
        maxTime = 30;
    }
    scoreDisplay.text(`Score: ${playerScore}`);
    fillDrawingDivs();
    checkTimer = setInterval(function () {
        updateTime();
    }, checkTime);
});

function updateTime() {
    if (continueGame) {
        time = maxTime - Math.floor((Date.now() - start) / 1000);
        timeDisplay.text(`Time: ${time}`);

        if (time < 0) {
            time = 0;
            timeDisplay.text(`Time: ${time}`);
            continueGame = false;

            $.ajax({
                type: 'PUT',
                url: `${window.location.pathname}/${playerScore}`,
                success: (response) => {
                    console.log('Score successfully updated');
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.log(`Error: ${textStatus} - ${errorThrown}`);
                }
            });

            alert(`Time's up!\nThe word was "${category}".\n\nScore: ${playerScore}\n\nClick "Play Again" to start a new game!`);
        }
    }
}

submitGuessBtn.click(() => {
    const playerGuess = input.val().trim().toLowerCase();

    if (continueGame && playerGuess) {
        const answer = category.toLowerCase();

        const flashDuration = 500;
        const flashesPerDuration = 3;

        if (playerGuess === answer) {
            scoreDisplay.text(`Score: ${++playerScore}`);
            input.val('');

            const greenFlashInterval = setInterval(() => {
                input.toggleClass('greenBorder');
            }, (flashDuration / flashesPerDuration) / 2);
            setTimeout(() => {
                clearInterval(greenFlashInterval);
                input.removeClass('greenBorder');
            }, flashDuration);

            fillDrawingDivs();
        } else {
            input.val('');

            revealHint();

            const redFlashInterval = setInterval(() => {
                input.toggleClass('redBorder');
            }, (flashDuration / flashesPerDuration) / 2);
            setTimeout(() => {
                clearInterval(redFlashInterval);
                input.removeClass('redBorder');
            }, flashDuration);
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
        start = Date.now();

        scoreDisplay.text(`Score: ${playerScore}`);
        input.val('');

        fillDrawingDivs();
    }
});

function revealHint() {
    let hint = hintDisplay.text();

    if (hint === category) return;
    
    let hintGiven = false;
    do {
        const i = _.random(category.length - 1);

        if (hint[i] == '-') {
            // hint[i] = category[i]
            // hintDisplay.text(hint);
            
            hintDisplay.text(hint.replaceAt(i, category[i]))
            hintGiven = true;
        }
    } while (!hintGiven)
}