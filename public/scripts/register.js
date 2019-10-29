let selector = '#registerForm';

$(selector).submit((event) => {
  event.preventDefault(); // prevents page from refreshing when submitting form

  $.ajax({
    type: 'POST',
    url: `${window.location.origin}/register`,
    data: $(selector).serialize(),
    success: (response) => {
      alert(response);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.log(`Error: ${textStatus} - ${errorThrown}`)
      alert(`${errorThrown}`);
    }
  });
});