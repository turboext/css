const yaml = require('js-yaml');
const glob = require('glob');
const fs = require('fs');
const { dirname } = require('path');
const { URL } = require('url');
const cssOrScss = require('./cssOrScss');

module.exports = function findCustom(url) {
    let origin;

    try {
        origin = new URL(url).origin;
    } catch(e) {
        console.log(e);
        return '';
    }

    const hosts = glob.sync('./hosts/*/HOSTS.yaml').map(file => {
        try {
            const styleFile = cssOrScss(dirname(file));

            return {
                hosts: yaml.safeLoad(fs.readFileSync(file, 'utf8')),
                style: styleFile
            };
        } catch(e) {
            console.log(e);
        }
    }).filter(data => data && data.style);

    const host = hosts.find(host => host.hosts.includes(origin));
    return host ? host.style : '';
};
