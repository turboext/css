const injectLiveReload = require('./inject-livereload');
const injectPrebuild = require('./inject-prebuild');
const injectPostCSSRuntime = require('./inject-postcss-runtime');

if (process.env.LIVERELOAD === 'true' && process.env.PUBLIC !== 'true' && process.env.NODE_ENV === 'development') {
    module.exports = function inject(req, html, host) {
        return injectLiveReload(req, html, host);
    };
} else if (process.env.NODE_ENV === 'development') {
    module.exports = function inject(req, html, host) {
        return injectPostCSSRuntime(req, html, host);
    };
} else {
    module.exports = function inject(req, html, origin) {
        return injectPrebuild(req, html, origin);
    };
}
