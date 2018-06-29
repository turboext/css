const getHostStyle = require('./get-host-style');
const postcss = require('../postcss');
const replaceCustomCSS = require('./replace-custom-css');
const removeCustomCSS = require('./remove-custom-css');

module.exports = function getHostCSS(req, html, origin) {
    const style = getHostStyle(origin);

    if (!style) {
        return Promise.resolve(removeCustomCSS(html));
    }

    return postcss(style).then(style => {
        return replaceCustomCSS(html, `<style data-name=custom>${style}</style>`);
    });
};
