const utils = require('../src/utils');

describe('utils', () => {
    it('check isThirdParty', () => {
        expect(utils.isThirdParty('https://example.org', null)).toBe(true);
        expect(utils.isThirdParty('https://example.org', 'https://example.com')).toBe(true);
        expect(utils.isThirdParty('https://test.example.org', 'https://example.org')).toBe(false);
        expect(utils.isThirdParty('https://example.org', 'https://test.example.org')).toBe(false);
    });
});
