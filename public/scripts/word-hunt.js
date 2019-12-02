const socket = io.connect(window.location.origin);

const drawingDivs = $(".drawing");
const categoryDiv = $("#category");

let svgArr = [];
let categoryArr = [];
let category = "";
let correctIndex;
let drawingCount = 0;
let allDrawingsLoaded = false;

$(document).ready(() => {
  gameEngine.displayScore();
  fillDrawingDivs();
});

function fillDrawingDivs() {
  svgArr = [];
  categoryArr = [];
  category = "";
  drawingCount = 0;
  continueGame = true;
  allDrawingsLoaded = false;

  socket.emit('clientRequestRandomCategoryNames', drawingDivs.length);
}

socket.on('serverSendRandomCategoryName', (cat) => {
  socket.emit('clientRequestFromCategory', cat);
});

socket.on('serverSendDrawing', (drawingData) => {
  const { word, svg } = drawingData;

  // assert.isNotEmpty(word);
  // assert.isString(word);

  // assert.isNotEmpty(svg);
  // assert.isString(svg);
  // assert.match(svg, /svg/);

  svgArr.push(svg);
  categoryArr.push(word);
  $(drawingDivs[drawingCount]).html(svgArr[drawingCount]);
  drawingCount++;
  allDrawingsLoaded = drawingCount === drawingDivs.length;

  if(allDrawingsLoaded) {
    setCorrectCategory();
  }
});

function setCorrectCategory() {
  correctIndex = randomRange(drawingDivs.length);
  category = categoryArr[correctIndex];

  categoryDiv.text(`Category: ${category}`);

  for (let i = 0; i < svgArr.length; i++) {
    $(drawingDivs[i]).html(svgArr[i]);
    $(drawingDivs[i]).on('click', function () {
      select(i);
    });
  }
}

function select(index) {
  if (continueGame && allDrawingsLoaded) {

    if (index === correctIndex) {
      alert("correct");
    } else {
      alert("incorrect");
    }
  }
}

function randomRange(upperbound) {
  // assert.isNumber(upperbound);

  return Math.floor(Math.random() * upperbound);
}
