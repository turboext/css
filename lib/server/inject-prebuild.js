const { join } = require('path');
const fs = require('fs-extra');
const replaceCustomCSS = require('./replace-custom-css');

async function getBuildResult(pullRequestDir) {
    const buildFile = join(pullRequestDir, 'build.json');
    const isExists = await fs.exists(buildFile);

    if (!isExists) {
        return null;
    }

    return JSON.parse(await fs.readFile(buildFile, 'utf8'));
}

module.exports = function injectPrebuild({ ctx: { pullRequest } }, html, origin) {
    return getBuildResult(pullRequest).then(build => {
        const key = build.hosts[origin];
        const css = build.css[key];

        return replaceCustomCSS(html, `<style data-name=custom>${css}</style>`);
    });
};
