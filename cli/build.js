const yaml = require('js-yaml');
const fs = require('fs-extra');
const { basename, join } = require('path');
const postcss = require('../lib/postcss');
const hostFiles = require('../lib/host-files.js');

const pullRequestDir = process.argv[2] ? join('checkout', process.argv[2].replace('/', '-')) : '.';

(async () => {
    const css = {};
    const hosts = {};

    try {
        if (!fs.existsSync(pullRequestDir)) {
            console.error(`Pull request directory "${pullRequestDir}" doesn't exists.`);
            process.exit(1);
        }

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
        process.exit(1);
    }
})();
