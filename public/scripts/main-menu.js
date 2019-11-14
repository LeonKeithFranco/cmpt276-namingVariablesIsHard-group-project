const gameModeMenu = $('#gameModeMenu');
const difficultyMenu = $('#difficultyMenu');
const confirmationMenu = $('#confirmationMenu');

$(document).ready(() => {
    difficultyMenu.hide();
    confirmationMenu.hide();
});

const standardBtn = $('#standardButton');
const oddOneOutBtn = $('#oddOneOutButton');
const timedBtn = $('#timedButton');

let gameMode;
let difficulty;

function gameModePicked() {
    gameModeMenu.hide();
    difficultyMenu.show();
}

standardBtn.click(function() {
    gameMode = standardBtn.text();
    gameModePicked()
});

oddOneOutBtn.click(function() {
    gameMode = oddOneOutBtn.text();
    gameModePicked()
});

timedBtn.click(function() {
    gameMode = timedBtn.text();
    gameModePicked()
});
