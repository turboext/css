const path = require('path');
const glob = require('glob');
const Yaml = require('js-yaml');
const fs = require('fs');
const { URL } = require('url');

const rules = [];

function styleFilesValidator(files) {
    if (files.includes('style.css') && files.includes('style.scss')) {
        return 'Should exists only one CSS entry point. Found both.';
    }

    if (!files.includes('style.css') && !files.includes('style.scss')) {
        return 'Should exists CSS entry point (style.css or style.scss).';
    }

    return true;
}

function ownersFilesValidator(files, dir) {
    const file = 'OWNERS.yaml';

    if (!files.includes(file)) {
        return `Should exists ${file}`;
    }

    try {
        Yaml.safeLoad(fs.readFileSync(path.join(dir, file), 'utf8'));
        return true;
    } catch(e) {
        return e;
    }
}

function hostsFileValidator(files, dir) {
    const file = 'HOSTS.yaml';

    if (!files.includes(file)) {
        return `Should exists ${file}`;
    }

    let hosts;
    try {
        hosts = Yaml.safeLoad(fs.readFileSync(path.join(dir, file), 'utf8'));
    } catch(e) {
        return e;
    }

    if (!Array.isArray(hosts)) {
        return `${file} should contains array of hostnames.'`;
    }

    const errs = validateHosts(hosts, dir);

    if (errs.length) {
        return errs.map(e => e.message).join(', ');
    }

    return true;
}

const uniqHost = new Map();

function validateHosts(hosts, dir) {
    return hosts.map(host => {
        try {
            const origin = new URL(host).origin;
            if (uniqHost.has(origin)) {
                throw new Error(`${origin} already exists in ${uniqHost.get(origin)}`);
            }
            uniqHost.set(origin, path.basename(dir));
            return true;
        } catch(e) {
            return e;
        }
    }).filter(res => res !== true);
}

rules.push(styleFilesValidator, ownersFilesValidator, hostsFileValidator);

function list() {
    return glob.sync('./hosts/*/');
}

function validator(dir) {
    const files = glob.sync(path.join(dir, '*')).map(file => path.basename(file));

    return rules.reduce((acc, rule) => {
        const result = rule(files, dir);

        if (result === true) {
            return acc;
        }

        return acc.concat({ rule: rule.name, error: result });
    }, []);
}

module.exports = {
    list,
    validator
};
