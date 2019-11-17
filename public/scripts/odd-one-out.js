let odd = randomRange(6);
let score = 0;
let num;

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
    drawPictures();
};

function drawPictures() {
    for (let i = 1; i <= num; i++) {
        requestDrawing(function () {
            drawPicture(i);
        });
    }
}

function requestDrawing(callback) {
    socket.emit('clientRequestDrawing', {
        category: "cat",
        id: 40323
    });

    setTimeout(callback,500);
}

function drawPicture(num) {
    document.getElementById('drawing' + num).innerHTML = svgList[num - 1];
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

