const fs = require('fs-extra');
const { resolve } = require('path');
const spawn = require('child_process').spawnSync;

const [ pullRequest = 'master' ] = process.argv.slice(2);
const checkoutDirectory = getCheckoutDirectory(pullRequest);

const cwd = process.cwd();

function getCheckoutDirectory(pull) {
    return resolve('checkout', pull.replace('/', '-'));
}

function exec(cmd, cwd = checkoutDirectory) {
    console.log(`${cwd} $ ${cmd}`);
    return spawn(cmd, { stdio: 'inherit', shell: true, cwd });
}

function clone() {
    const remotes = `
[remote "origin"]
    fetch = +refs/heads/*:refs/remotes/origin/*
    fetch = +refs/pull/*/head:refs/remotes/origin/pull/*
    `.trim();

    exec(`git clone https://github.com/turboext/css.git ${checkoutDirectory}`, cwd);
    exec(`echo '${remotes}' >> .git/config`);
    exec('git fetch --all');
}

function checkout(pullRequest) {
    exec(`git checkout ${pullRequest}`);
}

if (fs.existsSync(checkoutDirectory)) {
    exec(`rm -rf ${checkoutDirectory}`);
}

clone();
checkout(pullRequest);
