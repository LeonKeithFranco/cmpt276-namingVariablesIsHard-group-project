let selector = '#loginForm';

$(selector).submit((event) => {
  event.preventDefault(); // prevents page from refreshing when submitting form

  if (!hasIncorrectInputs()) {
    $.ajax({
      type: 'POST',
      url: '/login',
      data: $(selector).serialize(),
      success: (response) => {
        window.location.href = window.location.href = `${window.location.origin}/main-menu`;
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.log(`Error: ${textStatus} - ${errorThrown}`);
        alert(`${errorThrown}`);
      }
    });
  }
  else {
    alert('Please don\'t leave any fields blank and don\'t use any spaces in your username and password');
  }
});