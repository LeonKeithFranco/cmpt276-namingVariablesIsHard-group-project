const containsWhiteSpaceRegex = /\s/;

function hasIncorrectInputs() {
    let incorrect = false;

    $('input').each((i, elem) => {
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