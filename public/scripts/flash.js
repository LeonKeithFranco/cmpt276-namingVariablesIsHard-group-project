const flash = (function () {
    return {
        flashDuration: 500,
        flashesPerDuration: 3,
        green: function (HtmlElement) {
            flashElem('green', HtmlElement, this.flashDuration, this.flashesPerDuration);
        },
        red: function (HtmlElement) {
            flashElem('red', HtmlElement, this.flashDuration, this.flashesPerDuration);
        }
    }

    function flashElem(color, HtmlElement, flashDuration, flashesPerDuration) {
        const greenFlashInterval = setInterval(() => {
            HtmlElement.toggleClass(`${color}Border`);
        }, (flashDuration / flashesPerDuration) / 2);
        setTimeout(() => {
            clearInterval(greenFlashInterval);
            HtmlElement.removeClass(`${color}Border`);
        }, flashDuration);
    }
})();