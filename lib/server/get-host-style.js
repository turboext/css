const yaml = require('js-yaml');
const glob = require('glob');
const fs = require('fs');
const { dirname, join } = require('path');
const { URL } = require('url');

module.exports = function findCustom(url) {
    let origin;

    try {
        origin = new URL(url).origin;
    } catch(e) {
        return '';
    }

    const hosts = glob.sync('./hosts/*/HOSTS.yaml').map(file => {
        try {
            const dir = dirname(file);

            const css = join(dir, 'style.css');
            const scss = join(dir, 'style.scss');

            const cssExists = fs.existsSync(css);
            const scssExists = fs.existsSync(scss);

            return {
                hosts: yaml.safeLoad(fs.readFileSync(file, 'utf8')),
                dir,
                style: scssExists ? scss : cssExists ? css : ''
            };
        } catch(e) {
            console.log(e);
        }
    }).filter(data => data && data.style);

    const host = hosts.find(host => host.hosts.includes(origin));
    return host ? host.style : '';
};
