String.prototype.replaceAt = function (i, char) {
    if (i < 0 || i > this.length - 1) {
        // I know this looks goofy, but this way, it returns a string literal instead of a string object
        return this.toString(); 
    }

    return `${this.slice(0, i)}${char}${this.slice(i + 1, this.length)}`;
}
