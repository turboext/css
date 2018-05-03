const zlib = require('zlib');
const fs = require('fs-extra');
const glob = require('glob');

module.exports = function run(mask) {
    const files = glob.sync(mask);

    const promises = files.map(from => {
        const to = from.replace(/\.css$/, '.css.gz');
        const gzip = zlib.createGzip();
        const rs = fs.createReadStream(from);
        const ws = fs.createWriteStream(to);

        rs.pipe(gzip).pipe(ws);

        return new Promise(resolve => ws.once('finish', resolve));
    });

    return Promise.all(promises);
};

