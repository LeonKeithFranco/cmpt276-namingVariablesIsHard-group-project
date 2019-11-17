let odd = randomRange(6);
let score = 0;

window.onload = function() {
    console.log(difficulty);
    let num;
    if (difficulty === 'easy') {
        num = 6;
    } else if (difficulty === 'normal') {
        num = 4;
    } else if (difficulty === 'hard') {
        num = 3;
    }

    let i;
    for (i = 1; i <= num; i++) {
        // Line is needed because j is a block scoped variable
        let j = i;
        document.getElementById('drawing' + j).addEventListener('click', function () {
            select(j - 1);
        });
    }

    document.getElementById('score').innerHTML = "Score: "  + score;
    drawPictures();
};

function drawPictures() {
    socket.emit('clientRequestDrawing', {
        category: "cat",
        id: 4023
    });
    document.getElementById('drawing1').innerHTML = svgList[0];
}

function select (guess) {
    if (guess == odd) {
        score++;
        document.getElementById('score').innerHTML = "Score: "  + score;
        console.log('nice!');
    } else {
        gameOver();
        console.log('u suck');
    }
}

function gameOver() {

}

