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
    console.log(num);

    let i;
    for (i = 1; i <= num; i++) {
        let j = i;
        let tempString = 'drawing' + j;
        document.getElementById(tempString).addEventListener('click', function () {
            select(j - 1);
        });
    }

    console.log(randomRange(6));
};

function select (guess) {
    if (guess == odd) {
        score++;
        console.log('nice!');
    } else {
        gameOver();
        console.log('u suck');
    }
}

function gameOver() {

}

