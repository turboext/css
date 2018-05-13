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
    const master = getCheckoutDirectory('master');
    if (fs.existsSync(master)) {
        return exec(`cp -r ${master} ${checkoutDirectory}`, cwd);
    }

    const remotes = `
[remote "origin"]
    fetch = +refs/heads/*:refs/remotes/origin/*
    fetch = +refs/pull/*/head:refs/remotes/origin/pull/*
    `.trim();

    exec(`git clone https://github.com/turboext/css.git ${checkoutDirectory}`, cwd);
    exec(`echo '${remotes}' >> .git/config`);
}

function pull(pullRequest) {
    if (pullRequest === 'master') {
        // may be useful for PRs branch later
        exec('git fetch');
        exec('git pull origin master');
        return;
    }

    // may fail if branch has been rebased
    const { status } = exec(`git pull origin refs/${pullRequest}/head`);

    if (status !== 0) {
        console.log('Could not update PR. Recreating...');
        exec(`rm -rf ${checkoutDirectory}`, cwd);
        clone();
        checkout(pullRequest);
    }
}

function checkout(pullRequest) {
    exec(`git checkout ${pullRequest}`);
}

if (!fs.existsSync(checkoutDirectory)) {
    clone();
    checkout(pullRequest);
} else {
    pull(pullRequest);
}
