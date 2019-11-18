let odd = randomRange(6);
let score = 0;
let num;
let categoryTimer;
let sizeTimer;
let drawTimer;
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
    }, 10);
}

function getCategorySize(numPics) {
    if (category === "") {
    } else {
        clearInterval(categoryTimer);
        socket.emit('clientRequestCategorySize', category);
        sizeTimer = setInterval(function() {
            drawPictures(numPics);
        }, 10);
        console.log("nice");
    }

}

function drawPictures(numPics) {
    if (maxSize === 0) {
        console.log('and');
    } else {
        clearInterval(sizeTimer);
        for (let i = 1; i <= numPics; i++) {
            requestDrawing(i);
        }

    }
}

function requestDrawing(num) {
    socket.emit('clientRequestDrawing', {
        category: category,
        id: randomRange(maxSize)
    });

    drawTimer = setInterval(function() {
        drawPicture();
    }, 10);
}

function drawPicture() {
    if (svgList[num-2] === undefined) {
    } else {
        clearInterval(drawTimer);
        for (let i = 1; i < num; i++) {
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


