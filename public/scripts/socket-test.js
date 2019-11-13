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


$('#getDrawing').click(() => {
  const inputs = {
    category: $('#category').val(),
    id: $('#id').val()
  }

  console.log(inputs);

  socket.emit('clientRequestDrawing', inputs);
});

socket.on('serverSendDrawing', (data) => {
  draw(data);
});
