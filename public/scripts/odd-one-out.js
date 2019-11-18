let odd;
let score = 0;
let num;
let categoryTimer;
let sizeTimer;
let drawTimer;
let checkTime = 10;
let oneIteration = false;
let loaded = false;
maxSize = 0;
category = "";
svgList = [];

window.onload = function() {
    console.log(difficulty);
    if (difficulty === 'easy') {
        num = 6;
    } else if (difficulty === 'normal') {
        num = 4;
    } else if (difficulty === 'hard') {
        num = 3;
    }

    for (let i = 1; i <= num; i++) {
        document.getElementById('drawing' + i).addEventListener('click', function () {
            select(i - 1);
        });
    }

    document.getElementById('score').innerHTML = "Score: "  + score;
    gameLoop();
};

function gameLoop() {
    getRandomCategory(num);
}
function getRandomCategory(numPics) {
    socket.emit('clientRequestRandomCategoryName');

    categoryTimer = setInterval(function() {
        getCategorySize(numPics);
    }, checkTime);
}

function getCategorySize(numPics) {
    if (category === "") {
    } else {
        clearInterval(categoryTimer);
        socket.emit('clientRequestCategorySize', category);
        sizeTimer = setInterval(function() {
            getPics(numPics);
        }, checkTime);
    }

}

function getPics(numPics) {
    if (maxSize === 0) {

    } else {
        clearInterval(sizeTimer);
        for (let i = 1; i <= numPics; i++) {
            requestDrawing();
        }
        drawTimer = setInterval(function() {
            getOdd();
        }, checkTime);
    }
}

function requestDrawing() {
    socket.emit('clientRequestDrawing', {
        category: category,
        id: randomRange(maxSize)
    });
}

function getOdd() {
    if (svgList[num-1] === undefined) {

    } else if (svgList[num] === undefined && !oneIteration) {
        clearInterval(drawTimer);
        maxSize = 0;
        category = "";
        oneIteration = true;

        getRandomCategory(1);
    }  else if (svgList[num] != undefined) {
        clearInterval(drawTimer);
        drawPictures();
    }
}

function drawPictures() {
    odd = randomRange(num);

    for (let i = 1; i <= num; i++) {
        document.getElementById("drawing" + i).innerHTML = svgList[i-1];
    }
    document.getElementById("drawing" + (odd+1)).innerHTML = svgList[num];
    loaded = true;
}

function select (guess) {
    if (loaded) {
        if (guess == odd) {
            score++;
            document.getElementById('score').innerHTML = "Score: " + score;
            console.log('nice!');
        } else {
            gameOver();
        }
        while (svgList.length != 0) {
            svgList.pop();
        }
        maxSize = 0;
        category = "";
        oneIteration = false;
        clearInterval(sizeTimer);
        clearInterval(categoryTimer);
        clearInterval(drawTimer);
        if (svgList.length === 0) {
            gameLoop();
        }
        loaded = false;
    }
}

function gameOver() {
    alert('Game over: it was picture ' + (odd + 1));
    score = 0;
    document.getElementById('score').innerHTML = "Score: " + score;
}


