const yaml = require('js-yaml');
const fs = require('fs-extra');
const { basename, join } = require('path');
const postcss = require('../lib/postcss');
const hostFiles = require('../lib/host-files.js');

if (process.argv.length !== 3) {
    console.log('You should specify pull-request, for example: "pull/7"');
    process.exit(1);
}

const pullRequestDir = join('checkout', process.argv[2].replace('/', '-'));

(async () => {
    const css = {};
    const hosts = {};
    console.log(`${pullRequestDir}/hosts/*/`);

    try {
        console.assert(fs.existsSync(pullRequestDir), 'Pull request directory should exists.');

        for (const { host: dir } of hostFiles(`${pullRequestDir}/hosts/*/`)) {
            console.log(`Processing ${dir}`);
            const key = basename(dir);

            css[key] = await postcss(join(dir, 'style.css'));

            yaml.safeLoad(await fs.readFile(join(dir, 'HOSTS.yaml'), 'utf8'))
                .forEach(host => hosts[host] = key);
        }

        const output = join(pullRequestDir, 'build.json');
        fs.writeFileSync(output, JSON.stringify({ css, hosts }, null, 4));
        console.log(`Build was saved to ${output}`);
    } catch(e) {
        console.error(e);
    }
})();
