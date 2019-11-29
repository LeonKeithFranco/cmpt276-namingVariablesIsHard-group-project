const gameEngine = (function () {
  const socket = io.connect(window.location.origin);

  const drawingDivs = $(".drawing");
  const input = $('#wordInput');
  const scoreDisplay = $('#score');
  const submitGuessBtn = $('#submitGuessButton');
  const playAgainBtn = $('#playAgainButton');
  const hintDisplay = $('#hint');

  let svgArr = [];
  let category = "";
  let drawingCount = 0;
  let playerScore = 0;
  let continueGame = true;
  let allDrawingsLoaded = false;

  socket.on('serverSendRandomCategoryName', (cat) => {
    category = cat;
    hintDisplay.text(`Hint: ${category.replace(/\S/g, "-")}`);
    socket.emit('clientRequestCountFromCategory', {
      category: category,
      count: drawingDivs.length
    });
  });

  socket.on('serverSendDrawing', (drawingData) => {
    const { word, svg } = drawingData;
    svgArr.push(svg);
    $(drawingDivs[drawingCount]).html(svgArr[drawingCount]);
    drawingCount++;
    allDrawingsLoaded = drawingCount === drawingDivs.length;
  });

  input.keypress(function (e) {
    let key = e.which;
  
    if (key == 13) { // hitting enter key
      submitGuessBtn.click();
    }
  });

  return {
    fillDrawingDivs: function () {
      svgArr = [];
      category = "";
      drawingCount = 0;
      allDrawingsLoaded = false;

      socket.emit('clientRequestRandomCategoryName', drawingDivs.length);
    },
    setSubmitButtonClickEvent: function (clickEvent) {
      submitGuessBtn.click(clickEvent);
    },
    setPlayAgainButtonClickEvent: function (clickEvent) {
      playAgainBtn.click(clickEvent);
    },
    displayScore: function () {
      scoreDisplay.text(`Score: ${playerScore}`);
    },
    incrementScore: function () {
      ++playerScore;
    },
    resetScore: function () {
      playerScore = 0;
    },
    getUserInput: function () {
      return input.val().trim().toLowerCase();
    },
    resetUserInput: function () {
      input.val('');
    },
    getCategory: function () {
      return category.toLowerCase();
    },
    willContinueGame: function () {
      return continueGame;
    },
    stopGame: function () {
      continueGame = false;
    },
    restartGame: function () {
      continueGame = true;
    },
    isAllDrawingsLoaded: function () {
      return allDrawingsLoaded;
    },
    updateHighScore: function () {
      $.ajax({
        type: 'PUT',
        url: `${window.location.pathname}/${playerScore}`,
        success: (response) => {
          console.log('Score successfully updated');
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.log(`Error: ${textStatus} - ${errorThrown}`);
        }
      });
    },
    displayGameOverScreen: function () {
      alert(`Game over!\nThe word was "${category}".\n\nScore: ${playerScore}\n\nClick "Play Again" to start a new game!`);
    }
  }
})();