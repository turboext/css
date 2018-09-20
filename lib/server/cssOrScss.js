const { join } = require('path');
const fs = require('fs');

/**
 *
 * @param {string} dir - директория хоста
 * @returns {string}
 */
function cssOrScss(dir) {
    const css = join(dir, 'style.css');
    const scss = join(dir, 'style.scss');

    const cssExists = fs.existsSync(css);
    const scssExists = fs.existsSync(scss);

    return scssExists ? scss : cssExists ? css : '';
}

module.exports = cssOrScss;
