const meta = /<meta http-equiv=Content-Security-Policy content="[^"]+">/;

module.exports = function removeCSP(html) {
    return html.replace(meta, '');
};
