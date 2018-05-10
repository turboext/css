const express = require('express');
const app = module.exports = express();
const rp = require('request-promise');
const cheerio = require('cheerio')
const glob = require('glob');
const path = require('path');
const yaml = require('js-yaml');
const { URL } = require('url');
const chalk = require('chalk');
const fs = require('fs');
const postcss = require('./lib/postcss');

app.get('/', (req, res) => {
    require('fs').createReadStream('public/index.html').pipe(res);
});

/**
 *
 * @param url
 * @returns {string}
 */
function getHostname(url) {
    try {
        return new URL(url).origin;
    } catch(e) {
        return '';
    }
}

/**
 *
 * @param {string} origin
 * @return {Promise}
 */
function getHostCSS(origin) {
    const hosts = glob.sync('hosts/*/HOSTS.yaml').map(file => {
        try {
            return {
                hosts: yaml.safeLoad(fs.readFileSync(file, 'utf8')),
                style: path.resolve(path.join(path.dirname(file), 'style.css'))
            };
        } catch(e) {}
    }).filter(meta => {
        if (!meta) {
            return false;
        }

        return fs.existsSync(meta.style);
    });

    const host = hosts.find(host => host.hosts.includes(origin));

    if (!host) {
        return Promise.resolve('');
    }

    return postcss(host.style);
}

function normalize(str) {
    try {
        const url = new URL(str);
        if (url.hostname === 'yandex.ru') {
            return url.searchParams.get('text') || '';
        } else {
            return url;
        }
    } catch(e) {
        return '';
    }
}

function getTurbo(req, query) {
    const headers = { ...req.headers };
    delete headers.host;

    return rp({
        uri: query ? `https://yandex.ru/turbo?text=${query}` : `https://yandex.ru/turbo`,
        headers,
        gzip: true
    });
}

app.get('/turbo', (req, res, next) => {
    const query = normalize(req.query.text);
    const hostname = getHostname(query);

    if (!hostname) {
        return getTurbo(req, query).then(html => res.send(html)).catch(e => next(e));
    }

    Promise.all([getTurbo(req, query), getHostCSS(hostname)]).then(([html, style]) => {
        res.status(200);

        const $ = cheerio.load(html);

        $('meta[http-equiv=Content-Security-Policy]').remove();
        $(`<style>${style}</style>`).insertAfter($('style').last());

        res.send($.html());
    }).catch(e => next(e));
});

app.use((err, req, res) => {
    res.status(500);
    res.send(err);
});

app.listen(3000, () => {
    console.log(`DevServer started at ${chalk.blue.underline('http://localhost:3000')}`);
});