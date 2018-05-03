const size = require('../lib/size');
const gzip = require('../lib/gzip');
const clean = require('../lib/clean');
const chalk = require('chalk');

const BYTES = 21 * 1024; // 21 KB

function toKB(bytes, precision = 2) {
    return (bytes / 1024).toFixed(precision);
}

function toKBStr(bytes, precision) {
    return toKB(bytes, precision) + ' KB';
}

async function run() {
    await gzip('css/**/*.min.css');
    const fileSizes = await size('css/**/*.gz');

    await clean('css/**/*.min.css');
    await clean('css/**/*.gz');

    const bigFiles = fileSizes.filter(file => file.size > BYTES);

    if (!bigFiles.length) {
        process.exit(0);
    }

    console.info(chalk.blue('[INFO]'), 'MaxSize:', toKBStr(BYTES));

    bigFiles.forEach(({ file, size }) => {
        console.error(
            chalk.red.bold('[ERROR]'),
            file, '—', toKBStr(size),
            chalk.red('(+' + toKBStr(size - BYTES) + ')')
        );
    });

    process.exit(1);
}

run();
