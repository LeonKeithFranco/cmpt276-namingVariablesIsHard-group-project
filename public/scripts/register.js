let selector = '#registerForm';

$(selector).submit((event) => {
  event.preventDefault(); // prevents page from refreshing when submitting form

  if (!hasIncorrectInputs()) {
    $.ajax({
      type: 'POST',
      url: '/register',
      data: $(selector).serialize(),
      success: (response) => {
        alert('Registration successful\nWelcome to Scribbltaire.io!');
        window.location.href = `${window.location.origin}/login`;
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