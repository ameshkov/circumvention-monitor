const Matcher = require('../src/matcher');

describe('Matcher', () => {
    it('check simple criteria', () => {
        const matcher = new Matcher({
            urlPattern: '://example.org',
            contentPattern: 'alert',
            contentType: 'script',
            thirdParty: true,
        });
        const url = 'http://example.org/';
        const source = 'http://example.net';
        const type = 'script';
        const content = 'alert("hello");';

        const match = matcher.test(url, source, type, content);
        expect(match).toBe(true);
    });

    it('negative check simple criteria', () => {
        const matcher = new Matcher({
            urlPattern: '://example.org',
            contentPattern: 'alert',
            contentType: 'script',
            thirdParty: false,
        });
        const url = 'http://example.org/';
        const source = 'http://example.net';
        const type = 'script';
        const content = 'alert("hello");';

        const match = matcher.test(url, source, type, content);
        expect(match).toBe(false);
    });
});
