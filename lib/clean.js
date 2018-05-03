const fs = require('fs-extra');
const glob = require('glob');

module.exports = function run(mask) {
    const files = glob.sync(mask);

    return Promise.all(files.map(f => fs.unlink(f)));
};

