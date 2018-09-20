const fs = require('fs');
const postcss = require('../postcss');
const path = require('path');
const cssOrScss = require('./cssOrScss');

/**
 * Сборщик CSS'а для livereload
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function styleMiddlware(req, res, next) {
    if (!req.originalUrl.endsWith('style.min.css')) {
        return next();
    }

    const file = path.resolve(process.cwd(), req.originalUrl.substr(1).replace('min.css', 'css'));
    const styleFile = cssOrScss(path.dirname(file));

    if (styleFile) {
        console.log(`Bulding from ${styleFile}...`);
        return postcss(styleFile).then(style => {
            fs.writeFile(file.replace(/css$/, 'min.css'), style, 'utf8', next);
        }).catch(e => next(e));
    } else {
        console.error(`File ${file} doesn't exists`);
    }

    next();
}

module.exports = styleMiddlware;
