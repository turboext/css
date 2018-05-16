const replaceCSS = require('../lib/server/replace-custom-css');
const { describe, it } = require('mocha');
const assert = require('chai').assert;

describe('replace css', () => {
    const html = '<html><head><style>.body { color: black; }</style><style data-name=custom>.body { color: blue; }</style></head><body></body></html>';

    it('should remove old styles html string', () => {
        const htmlWithoutCSS = '<html><head><style>.body { color: black; }</style></head><body></body></html>';
        assert.equal(replaceCSS(html), htmlWithoutCSS);
    });
    
    it('should replace old styles with new one', () => {
        const htmlWithNewCSS = '<html><head><style>.body { color: black; }</style><style data-name=custom>.page { color: pink; }</style></head><body></body></html>';
        assert.equal(replaceCSS(html, '.page { color: pink; }'), htmlWithNewCSS);
    });
});
