const { sync } = require('glob');
const { join } = require('path');

module.exports = function* findHostFiles(dirs, mask) {
    const hostList = sync(dirs);

    for (const host of hostList) {
        yield {
            host,
            files: sync(join(host, mask))
        };
    }
};
