const replaceCustomCSS = require('./replace-custom-css');

const getHostStyle = require('./get-host-style');

module.exports = function injectLiveReload(req, html, host) {
    const style = getHostStyle(host);

    let lr = '';

    if (!style) {
        lr = `<script>console.error('LiveReload error: Can\\'t find styles for ${host}');</script>`;
    } else {
        const min = style.replace(/\.s?css$/, '.min.css');

        lr = [
            `<link rel="stylesheet" href="/${min}">`,
            '<script src="/vendors/livereload.js?host=localhost&port=35729"></script>'
        ].join('');
    }

    return Promise.resolve(replaceCustomCSS(html, lr));
};
