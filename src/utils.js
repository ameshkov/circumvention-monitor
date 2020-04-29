const tldts = require('tldts');

/**
 * Checks if the specified URL is third-party or not.
 *
 * @param {String} url - request url
 * @param {String} source - source url
 * @returns {Boolean} true if request is third-party.
 */
function isThirdParty(url, source) {
    return tldts.getDomain(url) !== tldts.getDomain(source);
}

module.exports = {
    isThirdParty,
};
