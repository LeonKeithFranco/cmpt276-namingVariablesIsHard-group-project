function hasIncorrectInputs() {
  let incorrect = false;
  const containsWhiteSpaceRegex = /\s/;

  $('input').each((i, elem) => {
    // assert.exists(elem);

    const inputStr = $(elem).val();
    const containsWhiteSpace = inputStr.match(containsWhiteSpaceRegex);
    const isBlank = inputStr === '';

    if (containsWhiteSpace || isBlank) {
      incorrect = true;

      return false; // breaks out of JQuery each loop
    }
  });

  return incorrect;
}