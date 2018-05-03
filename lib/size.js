const fs = require('fs-extra');
const glob = require('glob');

module.exports = async function size(mask) {
    const files = glob.sync(mask);

    return Promise.all(files.map(file => {
        return fs.stat(file).then(stats => ({ file, size: stats.size }));
    }));
};
