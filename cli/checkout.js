const fs = require('fs-extra');
const { resolve } = require('path');
const spawn = require('child_process').spawnSync;

const [ pullRequest = 'master' ] = process.argv.slice(2);
const checkoutDirectory = resolve('checkout', pullRequest.replace('/', '-'));

const cwd = process.cwd();

function exec(cmd, cwd = checkoutDirectory) {
    console.log(`${cwd} $ ${cmd}`);
    return spawn(cmd, { stdio: 'inherit', shell: true, cwd });
}

function updateRepository() {
    if (pullRequest === 'master') {
        exec('git pull origin master');
    } else {
        exec(`git pull origin ${pullRequest}/head:${pullRequest}`);
    }
}

function cloneRepository() {
    const remotes = `
        [remote "origin"]
        fetch = +refs/heads/*:refs/remotes/origin/*
        fetch = +refs/pull/*/head:refs/remotes/origin/pull/*
    `.trim();

    exec(`git clone https://github.com/turboext/css.git ${checkoutDirectory}`, cwd);
    exec(`echo '${remotes}' >> .git/config`);
    exec('git fetch --all');
}

function checkoutPR(pullRequest) {
    exec(`git checkout ${pullRequest}`);
}

const exists = fs.existsSync(checkoutDirectory);
exists ? updateRepository() : cloneRepository();

checkoutPR(pullRequest);
