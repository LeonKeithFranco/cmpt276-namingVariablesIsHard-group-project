const gameModeMenu = $('#gameModeMenu');
const difficultyMenu = $('#difficultyMenu');
const confirmationMenu = $('#confirmationMenu');

$(document).ready(() => {
    difficultyMenu.hide();
    confirmationMenu.hide();
});

let gameMode;
let difficulty;


const standardBtn = $('#standardButton');
const oddOneOutBtn = $('#oddOneOutButton');
const timedBtn = $('#timedButton');

function gameModePicked() {
    gameModeMenu.hide();
    difficultyMenu.show();
}

standardBtn.click(() => {
    gameMode = standardBtn.text();
    gameModePicked()
});

oddOneOutBtn.click(() => {
    gameMode = oddOneOutBtn.text();
    gameModePicked()
});

timedBtn.click(() => {
    gameMode = timedBtn.text();
    gameModePicked()
});


const easyBtn = $('#easyButton');
const normalBtn = $('#normalButton');
const hardBtn = $('#hardButton');
const backBtn = $('#backButton');