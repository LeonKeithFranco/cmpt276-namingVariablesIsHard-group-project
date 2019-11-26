let num;

const socket = io.connect(window.location.origin);

const drawingDivs = $(".drawing");
const scoreDisplay = $('#score');
const playAgainBtn = $('#playAgainButton');

let svgArr = [];
let svgOdd;
let category = "";
let oddCategory = "";
let drawingCount = 0;
let odd = 0;
let playerScore = 0;
let continueGame = true;
let allDrawingsLoaded = false;

socket.on('serverSendRandomCategoryName', (cat) => {
    if (category === "") {
        category = cat;
        socket.emit('clientRequestCountFromCategory', {
            category: category,
            count: drawingDivs.length
        });
    } else {
        oddCategory = cat;
        socket.emit('clientRequestFromCategory', oddCategory);
    }

});

socket.on('serverSendDrawing', (drawingData) => {
    const { word, svg } = drawingData;
    if (word === category) {
        svgArr.push(svg);
    } else {
        odd = randomRange(num);
        svgOdd = svg;
    }
    drawingCount++;
    allDrawingsLoaded = drawingCount === drawingDivs.length+1;
    if (allDrawingsLoaded) {
        for (let i = 0; i < svgArr.length; i++) {
            if (i !== odd) {
                $(drawingDivs[i]).html(svgArr[i]);
            } else {
                $(drawingDivs[i]).html(svgOdd);
            }
            $(drawingDivs[i]).on('click', function () {
                select(i);
            });
        }
    }
});

function randomRange(upperbound) {
    return Math.floor(Math.random() * upperbound);
}

function fillDrawingDivs() {
    svgArr = [];

    category = "";
    oddCategory = "";

    drawingCount = 0;
    allDrawingsLoaded = false;

    socket.emit('clientRequestRandomCategoryName');
    socket.emit('clientRequestRandomCategoryName');
}

$(document).ready(() => {
    console.log(difficulty);
    if (difficulty === 'easy') {
        num = 6;
    } else if (difficulty === 'normal') {
        num = 4;
    } else if (difficulty === 'hard') {
        num = 3;
    }
    scoreDisplay.text(`Score: ${playerScore}`);

    for (let i = 1; i <= num; i++) {
        document.getElementById('drawing' + i).addEventListener('click', function () {
            select(i - 1);
        });
    }

    fillDrawingDivs();
});

function select(index) {
    if (continueGame && allDrawingsLoaded) {

        if (index === odd) {
            scoreDisplay.text(`Score: ${++playerScore}`);

            fillDrawingDivs();
        } else {
            continueGame = false;

            alert(`Game over!\nIt was picture ${odd + 1}.\n\nScore: ${playerScore}\n\nClick "Play Again" to start a new game!`);
        }
    }
};

playAgainBtn.click(() => {
    if (allDrawingsLoaded) {
        console.log('play again clicked')
        continueGame = true;

        playerScore = 0;

        scoreDisplay.text(`Score: ${playerScore}`);

        fillDrawingDivs();
    }
});