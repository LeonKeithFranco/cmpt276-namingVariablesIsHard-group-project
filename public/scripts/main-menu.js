const standardBtn = $("#standardButton");
const oddOneOutBtn = $("#oddOneOutButton");
const timedBtn = $("#timedButton");

const difficultyHtml = `
    <h4 class="text">Choose your difficulty</h4>
    <button id="easyButton" class="button">Easy</button>
    <br>
    <button id="normalButton" class="button">Normal</button>
    <br>
    <button id="hardButton" class="button">Hard</button>
    <br>
    <button id="backButton" class="button">Back</button>
`

standardBtn.click(() => {
    $("#display").html(difficultyHtml);
});

oddOneOutBtn.click(() => {
    $("#display").html(difficultyHtml);
});

timedBtn.click(() => {
    $("#display").html(difficultyHtml);
});
