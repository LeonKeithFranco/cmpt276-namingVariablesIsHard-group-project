const socket = io.connect(window.location.origin);

const gameEngine = (function () {
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
    assert.isNotEmpty(cat);
    assert.isString(cat);

    category = cat;
    hintDisplay.text(`${category.replace(/\S/g, "-")}`);
    socket.emit('clientRequestCountFromCategory', {
      category: category,
      count: drawingDivs.length
    });
  });

  socket.on('serverSendDrawing', (drawingData) => {
    const { word, svg } = drawingData;

    assert.isNotEmpty(word);
    assert.isString(word);

    assert.isNotEmpty(svg);
    assert.isString(svg);
    assert.match(svg, /svg/);

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
    /*
      Precondition: HTML page must have a input element with the id of 'wordInput'
      Postcondition: Returns corresponding HTML input element as a JQuery object
    */
    getInputHtmlElement: function () {
      return input;
    },

    /*
      Precondition: HTML page must have div elements that have the class of 'drawing'
      Postcondition: Adds svg HTML elements into div elements
    */
    fillDrawingDivs: function () {
      svgArr = [];
      category = "";
      drawingCount = 0;
      allDrawingsLoaded = false;

      socket.emit('clientRequestRandomCategoryName', drawingDivs.length);
    },

    /*
      Precondition: HTML page must have a button with the id of 'submitGuessButton'
      Postcondition: Adds click event to button
    */
    setSubmitButtonClickEvent: function (clickEvent) {
      assert.isFunction(clickEvent);

      submitGuessBtn.click(clickEvent);
    },

    /*
      Precondition:HTML page must have a button with the id of 'playAgainButton'
      Postcondition: Adds click event to button
    */
    setPlayAgainButtonClickEvent: function (clickEvent) {
      assert.isFunction(clickEvent);

      playAgainBtn.click(clickEvent);
    },
    
    /*
      Precondition: HTML page must have paragraph element with the id of 'score'
      Postcondition: Display score on page
    */
    displayScore: function () {
      scoreDisplay.text(`Score: ${playerScore}`);
    },
    
    /*
      Precondition: None
      Postcondition: Increments playerScore variable
    */
    incrementScore: function () {
      ++playerScore;
    },
    
    /*
      Precondition: None
      Postcondition: Assigns 0 to playerScore variable
    */
    resetScore: function () {
      playerScore = 0;
    },
    
    /*
      Precondition: HTML page must have input element with id of 'wordInput'
      Postcondition: Returns modified string of the input value
    */
    getUserInput: function () {
      return input.val().trim().toLowerCase();
    },
    
    /*
      Precondition: HTML page must have input element with id of 'wordInput'
      Postcondition: Sets the input value to the blank string
    */
    resetUserInput: function () {
      input.val('');
    },
    
    /*
      Precondition: Category must have already been received from server
      Postcondition: Returns modified string of the category
    */
    getCategory: function () {
      return category.toLowerCase();
    },
    
    /*
      Precondition: None
      Postcondition: Returns the value of the continueGame variable
    */
    willContinueGame: function () {
      return continueGame;
    },
    
    /*
      Precondition: None
      Postcondition: Sets the value of the continueGame variable to false
    */
    stopGame: function () {
      continueGame = false;
    },
    
    /*
      Precondition: None
      Postcondition: Sets the value of the continueGame variable to true
    */
    restartGame: function () {
      continueGame = true;
    },
    
    /*
      Precondition: None
      Postcondition: Returns the value of the allDrawingsLoaded variable
    */
    isAllDrawingsLoaded: function () {
      return allDrawingsLoaded;
    },
    
    /*
      Precondition: Game must have been played on hard mode
      Postcondition: Sends score information to server
    */
    updateHighScore: function () {
      $.ajax({
        type: 'PUT',
        url: `${window.location.pathname}/${playerScore}`,
        success: (response) => {
          console.log('Score successfully updated');
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.error(`Error: ${textStatus} - ${errorThrown}`);
        }
      });
    },
    
    /*
      Precondition: None
      Postcondition: Displays an alert that shows the category word, player score, and a message to play again
    */
    displayGameOverScreen: function () {
      alert(`Game over!\nThe word was "${category}".\n\nScore: ${playerScore}\n\nClick "Play Again" to start a new game!`);
    },
    
    /*
      Precondition: Category must have already been recieved from server
      Postcondition: Reveals a random letter of the hint or none if all the letters of the hint have already been revealed
    */
    revealHint: function () {
      let hint = hintDisplay.text();

      if (hint === category) return;

      let hintGiven = false;
      do {
        const i = _.random(category.length - 1);

        if (hint[i] === '-') {
          hintDisplay.text(hint.replaceAt(i, category[i]));
          hintGiven = true;
        }
      } while (!hintGiven)
    }
  }
})();