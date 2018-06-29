const chalk = require('chalk');
const { basename } = require('path');
const { list, validator } = require('../lib/hosts');

const errors = list()
    .map(host => ({ host: basename(host), validation: validator(host) }))
    .filter(res => res.validation.length);

errors.forEach(res => {
    const validation = res.validation.map(v => `— ${v.error} ${chalk.gray(`[${v.rule}]`)}`).join('\n— ');
    console.error(`${chalk.red.bold(res.host)} has errors:\n${validation}`);
});

if (errors.length) {
    process.exit(1);
}
