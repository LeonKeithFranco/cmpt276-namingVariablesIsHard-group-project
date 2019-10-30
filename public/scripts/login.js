let selector = '#loginForm';

$(selector).submit((event) => {
  event.preventDefault(); // prevents page from refreshing when submitting form

  $.ajax({
    type: 'POST',
    url: '/login',
    data: $(selector).serialize(),
    success: (response) => {},
    error: (jqXHR, textStatus, errorThrown) => {
      console.log(`Error: ${textStatus} - ${errorThrown}`)
      alert(`${errorThrown}`);
    }
  });
});