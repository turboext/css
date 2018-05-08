const chalk = require('chalk');
const hostFiles = require('../lib/host-files.js');
const fs = require('fs');
const { URL } = require('url');
const yaml = require('js-yaml');

const uniqueHosts = new Map();

for (const { host, files } of hostFiles('./hosts/*/', 'HOSTS.yaml')) {
    console.assert(
        files.length === 1,
        chalk.red.bold(`Should be only one HOSTS.yaml file in ${host} directory`),
    );

    const file = files[0];

    let hosts;

    try {
        hosts = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    } catch(e) {
        console.error(chalk.red.bold(`Invalid YAML file ${file}`));
        console.error(e);
        process.exit(1);
    }

    console.assert(Array.isArray(hosts), 'YAML file should contains array of hostnames.');

    hosts.forEach(host => {
        let origin;

        try {
            origin = new URL(host).origin;
        } catch(e) {
            console.error(chalk.red.bold(`Invalid host in YAML file ${file}`));
            console.error(e);
            process.exit(1);
        }

        if (uniqueHosts.has(origin)) {
            console.error(chalk.red.bold(`Host '${origin}' found in ${file} already exists in YAML file ${uniqueHosts.get(origin)}`));
            process.exit(1);
        }

        uniqueHosts.set(origin, file);
    });
}