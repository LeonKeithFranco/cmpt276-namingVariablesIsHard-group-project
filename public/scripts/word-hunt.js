const socket = io.connect(window.location.origin);

const drawingDivs = $(".drawing");

let svgArr = [];
let categoryArr = [];
let category = "";
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

}
