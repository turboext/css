const replaceCSS = require('../lib/server/replace-custom-css');
const removeCSS = require('../lib/server/remove-custom-css');
const { describe, it } = require('mocha');
const assert = require('chai').assert;

describe('remove&replace css', () => {
    const html = '<html><head><style>.body { color: black; }</style><style data-name=custom>.body { color: blue; }</style></head><body></body></html>';

    it('should remove old styles html string', () => {
        const htmlWithoutCSS = '<html><head><style>.body { color: black; }</style><!--custom-css-placeholder--></head><body></body></html>';
        assert.equal(removeCSS(html), htmlWithoutCSS);
    });

    it('should replace old styles with new one', () => {
        const htmlWithNewCSS = '<html><head><style>.body { color: black; }</style><style data-name=custom>.page { color: pink; }</style></head><body></body></html>';
        assert.equal(replaceCSS(html, '<style data-name=custom>.page { color: pink; }</style>'), htmlWithNewCSS);
    });
});
