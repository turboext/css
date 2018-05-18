if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

if (!process.env.LIVERELOAD) {
    process.env.LIVERELOAD = 'true';
}

const express = require('express');
const app = module.exports = express();
const rp = require('request-promise');
const { URL } = require('url');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const compression = require('compression');

const removeCSP = require('./lib/server/remove-csp');
const inject = require('./lib/server/inject');

const styleMiddlware = require('./lib/server/style-middleware');

if (process.env.NODE_ENV !== 'development') {
    app.use((req, res, next) => {
        const match = req.hostname.match(/^(.+)\.turboext\.net$/);
        let pullRequest;

        if (match && fs.existsSync(path.join('checkout', match[1]))) {
            pullRequest = match[1];
        } else {
            return res.redirect('https://master.turboext.net');
        }

        req.ctx = req.ctx || {};
        req.ctx.pullRequest = pullRequest;

        next();
    });
}

app.use(styleMiddlware);
app.use(express.static('public'));
app.use('/hosts', express.static('hosts'));

app.use(compression());

app.use((req, res, next) => {
    const url = normalize(req.query.text);

    req.ctx = req.ctx || {};
    req.ctx.url = url;
    req.ctx.hostname = getHostname(url);

    next();
});

app.get('/turbo', (req, res, next) => {
    const {
        url,
        hostname
    } = req.ctx;

    const params = cleanupParams(req.query);

    if (!hostname) {
        return getTurbo(req, url, params).then(html => res.send(html)).catch(e => next(e));
    }

    if (params.ajax_type) {
        return getTurbo(req, url, params).then(html => res.send(html)).catch(e => next(e));
    }

    getTurbo(req, url, params)
        .then(html => inject(req, html, hostname))
        .then(html => res.send(html))
        .catch(e => next(e));
});

app.get('/frame', (req, res, next) => {
    fs.readFile('public/frame.html', 'utf8', (e, html) => {
        if (e) {
            return next(e);
        }

        res.send(html.replace(
            '/turbo?placeholder=1',
            req.originalUrl.replace('/frame', '/turbo')
        ));
    });
});

app.use((req, res) => {
    res.status(404);
    res.end('Unknown route');
});

app.use((err, req, res) => {
    res.status(500);
    res.end(err);
});

const DEV_SERVER_PORT = 3000;
const LIVRELOAD_PORT = 35729;
const PUBLIC = process.env.PUBLIC === 'true';

console.log(`NODE_ENV=${process.env.NODE_ENV}, LIVRELOAD=${process.env.LIVERELOAD}, PUBLIC=${process.env.PUBLIC}`);

app.listen(DEV_SERVER_PORT, () => {
    if (PUBLIC) {
        const ngrok = require('ngrok');

        ngrok.connect(DEV_SERVER_PORT).then(url => {
            console.log(`DevServer started at ${chalk.blue.underline(`${url}`)}`);
        }).catch(e => {
            console.error(e);
            process.exit(1);
        });
    } else {
        console.log(`DevServer started at ${chalk.blue.underline(`http://localhost:${DEV_SERVER_PORT}`)}`);
    }
});

if (process.env.LIVERELOAD === 'true' && process.env.NODE_ENV !== 'production') {
    if (PUBLIC) {
        console.log('Livereload has beed disabled due public mode');
        process.env.LIVERELOAD = 'false';
    } else {
        const livereload = require('./lib/server/lr');
        livereload().listen(LIVRELOAD_PORT, () => {
            console.log(`LiveReload started at ${chalk.blue.underline(`http://localhost:${LIVRELOAD_PORT}`)}`);
        });
    }
}

/**
 **
 * @param url
 * @returns {string}
 */
function getHostname(url) {
    try {
        return new URL(url).origin;
    } catch (e) {
        return '';
    }
}

function normalize(str) {
    try {
        const url = new URL(str);
        if (url.hostname === 'yandex.ru') {
            return url.searchParams.get('text') || '';
        } else {
            return url;
        }
    } catch (e) {
        return '';
    }
}

function cleanupParams(queryParams) {
    if (!queryParams) {
        return {};
    }

    const params = { ...queryParams };
    delete params.text;

    return params;
}

function getTurbo(req, url, params) {
    const headers = { ...req.headers };
    delete headers.host;

    const queryString = qs.stringify(params);

    return rp({
        uri: url ?
            `https://yandex.ru/turbo?text=${url}${queryString ? `&${queryString}` : '' }` :
            'https://yandex.ru/turbo',
        headers,
        gzip: true
    }).then(removeCSP);
}
