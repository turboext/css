const postcss = require('../lib/postcss');
const glob = require('glob');
const fs = require('fs');
const files = glob.sync('./hosts/**/style.*').filter(file => !file.endsWith('min.css'));
const async = require('async');
const queue = async.queue(async ({ from, to }, callback) => {
    process.stdout.write(`Minify ${from}...`);

    try {
        const result = await postcss(from, to);
        fs.writeFileSync(to, result);
        process.stdout.write('ok');
    } catch(e) {
        process.stdout.write('failed');
        console.log(e);
    }
    console.log('');

    callback();
}, 1);

queue.drain = () => console.log('All items has been uploaded');

queue.push(files.map(from => {
    const to = from.replace(/\.s?css$/, '.min.css');
    return { from, to };
}));
