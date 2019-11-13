const socket = io(window.location.origin)

function draw(drawing) {
  const { word, svg } = drawing;

  $('#word').html(word);
  $('#drawing').html(svg);
}

$('#getRandomDrawing').click(() => {
  socket.emit('clientRequestRandomDrawing');
});

socket.on('serverSendRandomDrawing', (data) => {
  draw(data);
});