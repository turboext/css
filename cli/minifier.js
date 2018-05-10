const postcss = require('../lib/postcss');
const fs = require('fs');
const files = glob.sync('./hosts/**/*.css');

files.forEach(from => {
    const to = from.replace(/\.css$/, '.min.css');
    postcss(from, to).then(result => fs.writeFile(to, result));
});
