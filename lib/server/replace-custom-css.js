const removeCustomCSS = require('./remove-custom-css');

module.exports = function replaceCustomCSS(html, style) {
    return removeCustomCSS(html).replace('<!--custom-css-placeholder-->', style);
};
