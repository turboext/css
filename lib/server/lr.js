const chokidar = require('chokidar');
const postcss = require('../postcss');
const fs = require('fs');
const lr = require('tiny-lr');

const watcher = chokidar.watch('./hosts/**/*.css', {
    ignored: /\.min\.css$/,
    persistent: true
});

const ready = () => {
    const update = file => {
        const build = file.replace(/style\.s?css$/, 'style.min.css');

        postcss(file).then(style => {
            fs.writeFile(build, style, 'utf8', () => lr.changed(file));
        }).catch(e => console.error(e));
    };

    const remove = file => {
        fs.unlink(file.replace(/\.s?css$/, '.min.css'));
    };

    watcher
        .on('add', file => update(file))
        .on('change', file => update(file))
        .on('unlink', file => remove(file));
};

watcher.on('ready', ready);

module.exports = lr;
