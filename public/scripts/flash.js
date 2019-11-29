const flash = (function () {
  return {
    flashDuration: 500, // milliseconds
    flashesPerDuration: 3, // one 'flash' is a single on/off cycle

    /*
      Precondition: Must be passed a valid HTML Element
      Postcondition: Flashs a green border on the HTML Element
    */
    green: function (HtmlElement) {
      flashElem('green', HtmlElement, this.flashDuration, this.flashesPerDuration);
    },

    /*
      Precondition: Must be passed a valid HTML Element
      Postcondition: Flashs a red border on the HTML Element
    */
    red: function (HtmlElement) {
      flashElem('red', HtmlElement, this.flashDuration, this.flashesPerDuration);
    }
  }

  // private helper
  function flashElem(color, HtmlElement, flashDuration, flashesPerDuration) {
    assert.isObject(HtmlElement);

    const flashInterval = setInterval(() => {
      HtmlElement.toggleClass(`${color}Border`);
    }, (flashDuration / flashesPerDuration) / 2);
    setTimeout(() => {
      clearInterval(flashInterval);
      HtmlElement.removeClass(`${color}Border`);
    }, flashDuration);
  }
})();