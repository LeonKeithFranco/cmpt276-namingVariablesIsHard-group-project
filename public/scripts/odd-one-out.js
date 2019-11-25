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
let sameDrawingsLoaded = false;
let allDrawingsLoaded = false;

// window.onload = function() {
//     for (let i = 1; i <= num; i++) {
//         document.getElementById('drawing' + i).addEventListener('click', function () {
//             select(i - 1);
//         });
//     }
//     gameLoop();
// };
//
// function gameLoop() {
//     getRandomCategory(num);
// }
// function getRandomCategory(numPics) {
//     socket.emit('clientRequestRandomCategoryName');
//
//     categoryTimer = setInterval(function() {
//         getCategorySize(numPics);
//     }, checkTime);
// }
//
// function getCategorySize(numPics) {
//     if (category === "") {
//     } else {
//         clearInterval(categoryTimer);
//         socket.emit('clientRequestCategorySize', category);
//         sizeTimer = setInterval(function() {
//             getPics(numPics);
//         }, checkTime);
//     }
//
// }
//
// function getPics(numPics) {
//     if (maxSize === 0) {
//
//     } else {
//         clearInterval(sizeTimer);
//         for (let i = 1; i <= numPics; i++) {
//             requestDrawing();
//         }
//         drawTimer = setInterval(function() {
//             getOdd();
//         }, checkTime);
//     }
// }
//
// function requestDrawing() {
//     socket.emit('clientRequestDrawing', {
//         category: category,
//         id: randomRange(maxSize)
//     });
// }
//
// function getOdd() {
//     if (svgList[num-1] === undefined) {
//
//     } else if (svgList[num] === undefined && !oneIteration) {
//         clearInterval(drawTimer);
//         maxSize = 0;
//         category = "";
//         oneIteration = true;
//
//         getRandomCategory(1);
//     }  else if (svgList[num] != undefined) {
//         clearInterval(drawTimer);
//         drawPictures();
//     }
// }
//
// function drawPictures() {
//     odd = randomRange(num);
//
//     for (let i = 1; i <= num; i++) {
//         document.getElementById("drawing" + i).innerHTML = svgList[i-1];
//     }
//     document.getElementById("drawing" + (odd+1)).innerHTML = svgList[num];
//     loaded = true;
// }
//
// function select (guess) {
//     if (loaded) {
//         if (guess == odd) {
//             score++;
//             document.getElementById('score').innerHTML = "Score: " + score;
//             console.log('nice!');
//         } else {
//             gameOver();
//         }
//         while (svgList.length != 0) {
//             svgList.pop();
//         }
//         maxSize = 0;
//         category = "";
//         oneIteration = false;
//         clearInterval(sizeTimer);
//         clearInterval(categoryTimer);
//         clearInterval(drawTimer);
//         if (svgList.length === 0) {
//             gameLoop();
//         }
//         loaded = false;
//     }
// }
//
// function gameOver() {
//     alert('Game over: it was picture ' + (odd + 1));
//     score = 0;
//     document.getElementById('score').innerHTML = "Score: " + score;
// }


socket.on('serverSendRandomCategoryName', (cat) => {
    if (category === "") {
        category = cat;
        socket.emit('clientRequestCategorySize', category);
    } else {
        oddCategory = cat;
        socket.emit('clientRequestCategorySize', oddCategory);
    }

});

socket.on('serverSendCategorySize', (categorySize) => {
    if (!sameDrawingsLoaded) {
        sameDrawingsLoaded = true;

        const drawingIds = randomArray(categorySize, drawingDivs.length);

        drawingDivs.each(function (index) {
            socket.emit('clientRequestDrawing', { category: category, id: drawingIds[index] });
        });
    } else {
        socket.emit('clientRequestDrawing', { category: oddCategory, id: randomRange(categorySize)});
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
            if (i != odd) {
                $(drawingDivs[i]).html(svgArr[i]);
            } else {
                $(drawingDivs[i]).html(svgOdd);
            }
        }
    }
});

function fillDrawingDivs() {
    svgArr = [];
    category = "";
    drawingCount = 0;
    allDrawingsLoaded = false;

    socket.emit('clientRequestRandomCategoryName');
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

function shuffle (array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

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

            alert(`Game over!\nThe word was "${category}".\n\nScore: ${playerScore}\n\nClick "Play Again" to start a new game!`);
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