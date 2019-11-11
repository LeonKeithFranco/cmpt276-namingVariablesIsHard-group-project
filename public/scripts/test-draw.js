$('#getDrawingButton').click(() => {
  $.ajax({
    type: 'GET',
    url: '/send-drawing',
    success: (response) => {
      const { word, svg } = response;

      $('#word').html(word);
      $('#drawing').html(svg);
    }
  });
});