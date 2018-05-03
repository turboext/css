const fs = require('fs-extra');
const glob = require('glob');
const postcss = require('postcss');
const postcssConfig = require('../postcss.config');

module.exports = async function run() {
    const files = glob.sync('./css/**/*.css');

    const promises = files.map(async from => {
        const content = await fs.readFile(from, 'utf-8');
        const to = from.replace(/\.css$/, '.min.css');

        return postcss(postcssConfig.plugins)
            .process(content, { from, to })
            .then(result => fs.writeFile(to, result.css));
    });

    return await Promise.all(promises);
}

