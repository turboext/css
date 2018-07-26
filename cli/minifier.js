const postcss = require('../lib/postcss');
const glob = require('glob');
const fs = require('fs');
const async = require('async');
const path = require('path');
const files = findTargets(process.argv[2]);

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

queue.drain = () => console.log('All items has been minified');

queue.push(files.map(from => {
    const to = from.replace(/\.s?css$/, '.min.css');
    return { from, to };
}));

function findTargets(where) {
    if (where && where.endsWith('css')) {
        return where;
    }

    const search = path.resolve(__dirname, '../hosts/**/*css');

    return glob.sync(search)
        .filter(file => where ? file.includes(where) : true)
        .filter(file => file.endsWith('css') && !file.endsWith('min.css'));
}
