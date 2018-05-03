const chalk = require('chalk');
const { basename } = require('path');
const hostFiles = require('../lib/host-files.js');

for (const { host, files } of hostFiles('./css/*/', '*.css')) {
    console.assert(
        files.length === 1,
        chalk.red.bold(`Should be only one CSS file in ${host} directory`),
    );

    console.assert(
        basename(files[0]) === 'style.css',
        chalk.red.bold(`CSS file '${files[0]}' should have name 'style.css' in ${host} directory`),
    );
}
