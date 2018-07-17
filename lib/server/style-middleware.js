const fs = require('fs');
const postcss = require('../postcss');
const path = require('path');

const rebuilded = new Map();

module.exports = function styleMiddlware(req, res, next) {
    if (!req.originalUrl.endsWith('style.min.css')) {
        console.log('skip');
        return next();
    }

    // @TODO: add support for scss
    const file = path.resolve(process.cwd(), req.originalUrl.substr(1).replace('min.css', 'css'));

    if (rebuilded.has(file)) {
        return next();
    }

    if (fs.existsSync(file)) {
        rebuilded.set(file, true);

        return postcss(file).then(style => {
            fs.writeFile(file.replace(/css$/, 'min.css'), style, 'utf8', next);
        }).catch(e => next(e));
    } else {
        console.error(`File ${file} doesn't exists`);
    }

    next();
};
