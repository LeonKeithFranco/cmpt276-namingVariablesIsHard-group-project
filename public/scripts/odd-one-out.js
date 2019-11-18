let odd = randomRange(6);
let score = 0;
let num;
let categoryTimer;
let sizeTimer;
let drawTimer;
let checkTime = 1000;
let oneIteration = false;
let sameCategory = 0;
let oddCategory = 0;

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
    getRandomCategory(num-1);
};

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
        console.log('nice');
        socket.emit('clientRequestCategorySize', category);
        sizeTimer = setInterval(function() {
            drawPictures(numPics);
        }, checkTime);
        console.log("nice");
    }

}

function drawPictures(numPics) {
    if (maxSize === 0) {
        console.log('and');
    } else {
        clearInterval(sizeTimer);
        console.log(numPics);
        for (let i = 1; i <= numPics; i++) {
            requestDrawing();
        }
        drawTimer = setInterval(function() {
            drawPicture();
        }, checkTime);
    }
}

function requestDrawing() {
    console.log('requesting');
    console.log(maxSize);
    socket.emit('clientRequestDrawing', {
        category: category,
        id: randomRange(maxSize)
    });
}

function drawPicture() {
    if (svgList[num-2] === undefined) {

    } else if (svgList[num-1] === undefined && !oneIteration) {
        clearInterval(drawTimer);
        maxSize = 0;
        category = "";
        oneIteration = true;

        console.log('one iteration');
        getRandomCategory(1);
    }
    else {
        console.log('made it');
        clearInterval(drawTimer);
        for (let i = 1; i <= num; i++) {
            document.getElementById('drawing' + i).innerHTML = svgList[i - 1];
        }
    }
}

function select (guess) {
    if (guess == odd) {
        score++;
        document.getElementById('score').innerHTML = "Score: "  + score;
        console.log('nice!');
    } else {
        gameOver();
    }
}

function gameOver() {
    console.log('u suck');
}


