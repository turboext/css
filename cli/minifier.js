const postcss = require('../lib/postcss');
const glob = require('glob');
const fs = require('fs');
const files = glob.sync('./hosts/**/style.s?css').filter(file => !file.endsWith('min.css'));

files.forEach(from => {
    const to = from.replace(/\.css$/, '.min.css');
    postcss(from, to).then(result => fs.writeFile(to, result, () => void 0));
});
