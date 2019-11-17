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
        console.log(j);
        let tempString = 'drawing' + j;
        document.getElementById(tempString).addEventListener('click', function () {
            console.log(j);
        });
    }
};