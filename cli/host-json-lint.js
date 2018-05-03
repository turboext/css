const chalk = require('chalk');
const { basename } = require('path');
const hostFiles = require('../lib/host-files.js');
const fs = require('fs');
const { URL } = require('url');

const uniqueHosts = new Map();

for (const { host, files } of hostFiles('./css/*/', '*.json')) {
    console.assert(
        files.length === 1,
        chalk.red.bold(`Should be only one JSON file in ${host} directory`),
    );

    const file = files[0];

    console.assert(
        basename(file) === 'hosts.json',
        chalk.red.bold(`JSON file '${file}' should have name 'hosts.json' in ${host} directory`),
    );

    let json = fs.readFileSync(file);

    try {
        json = JSON.parse(json);
    } catch(e) {
        console.error(chalk.red.bold(`Invalid JSON file ${file}`));
        console.error(e);
        process.exit(1);
    }

    json.forEach(host => {
        let origin;

        try {
            origin = new URL(host).origin;
        } catch(e) {
            console.error(chalk.red.bold(`Invalid host in JSON file ${file}`));
            console.error(e);
            process.exit(1);
        }

        if (uniqueHosts.has(origin)) {
            console.error(chalk.red.bold(`Host '${origin}' found in ${file} already exists in JSON file ${uniqueHosts.get(origin)}`));
            process.exit(1);
        }

        uniqueHosts.set(origin, file);
    });
}