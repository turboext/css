const fs = require('fs-extra');
const postcssScss = require('postcss-scss');
const postcssConfig = require('../postcss.config');
let postcss;

module.exports = async function run(from, to) {
    postcss = postcss || (postcss = require('postcss'));

    const content = await fs.readFile(from, 'utf-8');

    return postcss(postcssConfig.plugins)
        .process(content, { from, to, syntax: postcssScss })
        .then(result => result.css);
};

