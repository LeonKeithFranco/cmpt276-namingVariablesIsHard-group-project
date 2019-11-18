let odd = randomRange(6);
let score = 0;
let num;
let timer;

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
        requestDrawing(i);
    }
}

// function getCategorySize() {
//     socket.emit('clientRequestCategorySize', "cat");
// }

function requestDrawing(num) {
    socket.emit('clientRequestDrawing', {
        category: "cat",
        id: 4230
    });

    timer = setInterval(function() {
        drawPicture(num);
    }, 100);
}

function drawPicture(num) {
    if (svgList[num-1] === undefined) {
        console.log(num);
    } else {
        document.getElementById('drawing' + num).innerHTML = svgList[num - 1];
        if (num === 6) {
            clearInterval(timer);
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

