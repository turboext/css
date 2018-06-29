const yaml = require('js-yaml');
const fs = require('fs-extra');
const { basename, join } = require('path');
const postcss = require('../lib/postcss');
const glob = require('glob');

const pullRequestDir = process.argv[2] ? join('checkout', process.argv[2].replace('/', '-')) : '.';

const css = {};
const hosts = {};

(async () => {
    try {
        if (!fs.existsSync(pullRequestDir)) {
            console.error(`Pull request directory "${pullRequestDir}" doesn't exists.`);
            process.exit(1);
        }

        const promises = glob.sync(`${pullRequestDir}/hosts/*/`).map(async dir => {
            console.log(`Processing ${basename(dir)}`);
            const key = basename(dir);

            const cssFile = join(dir, 'style.css');
            const scssFile = join(dir, 'style.scss');
            const style = fs.existsSync(scssFile) ? scssFile : fs.existsSync(cssFile) ? cssFile : '';

            css[key] = await postcss(style);

            yaml.safeLoad(fs.readFileSync(join(dir, 'HOSTS.yaml'), 'utf8'))
                .forEach(host => hosts[host] = key);
        });

        await Promise.all(promises);

        const output = join(pullRequestDir, 'build.json');
        fs.writeFileSync(output, JSON.stringify({ css, hosts }, null, 4));

        console.log(`Build was saved to ${output}`);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
})();
