const express = require('express');
const app = module.exports = express();
const rp = require('request-promise');
const cheerio = require('cheerio');
const { URL } = require('url');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');

const getHostCSS = require('./lib/server/get-host-css');

app.get('/', (req, res) => {
    require('fs').createReadStream('public/index.html').pipe(res);
});

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
    });
}

app.use(express.static('public'));

app.use((req, res, next) => {
    const url = normalize(req.query.text);

    req.ctx = {
        url,
        hostname: getHostname(url)
    };

    next();
});

if (process.env.NODE_ENV !== 'development') {
    app.use((req, res, next) => {
        const match = req.hostname.match(/^(.+)\.turboext\.net$/);
        let pullRequest;

        if (match && fs.existsSync(path.join('checkout', match[1]))) {
            pullRequest = match[1];
        } else {
            return res.redirect('https://master.turboext.net');
        }

        req.ctx.pullRequest = pullRequest;

        next();
    });
}

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

    Promise.all([getTurbo(req, url, params), getHostCSS(req, hostname)]).then(([html, style]) => {
        const $ = cheerio.load(html);

        $('meta[http-equiv=Content-Security-Policy]').remove();
        $(`<style>${style}</style>`).insertAfter($('style').last());

        res.send($.html());
    }).catch(e => next(e));
});

app.use((req, res) => {
    res.status(404);
    res.end('Unknown route');
});

app.use((err, req, res) => {
    res.status(500);
    res.end(err);
});

app.listen(3000, () => {
    console.log(`DevServer started at ${chalk.blue.underline('http://localhost:3000')}`);
});
