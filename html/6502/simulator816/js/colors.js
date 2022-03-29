/**
 * Converts a color represented in 6 bits to a CSS color string
 * @param {*} r Red color value
 * @param {*} g Green color value
 * @param {*} b Blue color value
 * @returns CSS Color String
 */
function colorFrom6bit(r, g, b) {
    return toHexColor(r * 64, g * 64, b * 64);
}


function colorFromByte(b) {
    return colorFrom6bit(b % 4,Math.floor(b/4) % 4, Math.floor(b/16));
}

/**
 * Converts a color represented in 12 bits to a CSS color string
 * @param {*} r Red color value
 * @param {*} g Green color value
 * @param {*} b Blue color value
 * @returns CSS Color String
 */
function colorFrom12bit(r, g, b) {
    return toHexColor(r * 16, g * 16, b * 16);
}


/**
 * Converts a number to its hexadecimal equivalant
 * @param {*} n Value to convert
 * @returns String, representing value in hexadecimal
 */

function hex(n) {
    return n.toString(16).toUpperCase();
}

/**
 * Combines red green and blue components into a single css color string
 * @param {Number} r Red
 * @param {Number} g Green
 * @param {Number} b Blue
 * @param {Number} [a] Transparancy
 * @returns CSS Color String
 */
function toHexColor(r, g, b, a) {
    if (a) {
        return "#" + hex(r) + hex(g) + hex(b) + hex(a * 255);
    } //Else
    return "#" + hex(r) + hex(g) + hex(b);
}

export { colorFromByte, colorFrom6bit, colorFrom12bit, toHexColor, hex };