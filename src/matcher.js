const Wildcard = require('./wildcard');
const utils = require('./utils');

/**
 * We use this class to match content criteria.
 * We have a list of different criteria for every circumvention system.
 *
 * Every criteria consists of the following fields (each of them is optional):
 *
 * urlPattern: string, wildcard or regex we check URL against
 * contentPattern: string, wildcard or regex we check content against
 * contentType: one of the https://github.com/puppeteer/puppeteer/blob/v3.0.2/docs/api.md#requestresourcetype
 * thirdParty: boolean
 */
class Matcher {
    /**
     * Creates an instance of the Matcher object.
     *
     * @param {*} criteria matching criteria
     */
    constructor(criteria) {
        if (criteria.urlPattern) {
            this.urlPattern = new Wildcard(criteria.urlPattern);
        } else {
            this.urlPattern = null;
        }

        if (criteria.contentPattern) {
            this.contentPattern = new Wildcard(criteria.contentPattern);
        } else {
            this.contentPattern = null;
        }

        if (criteria.contentType) {
            this.contentType = criteria.contentType;
        } else {
            this.contentType = null;
        }

        if (typeof criteria.thirdParty === 'boolean') {
            this.thirdParty = criteria.thirdParty;
        } else {
            this.thirdParty = null;
        }
    }

    /**
     * Tests the specified request against this matcher
     *
     * @param {String} url - request URL
     * @param {String} source - main frame URL
     * @param {String} type - content type
     * @param {String} content - response content (only if not binary)
     * @returns {Boolean} returns true if request matches this criteria
     */
    test(url, source, type, content) {
        if (this.urlPattern != null) {
            if (!this.urlPattern.test(url)) {
                return false;
            }
        }

        if (this.contentType != null) {
            if (this.contentType !== type) {
                return false;
            }
        }

        if (this.contentPattern != null) {
            if (!content) {
                return false;
            }

            if (!this.contentPattern.test(content)) {
                return false;
            }
        }

        if (typeof this.thirdParty === 'boolean') {
            if (this.thirdParty !== utils.isThirdParty(url, source)) {
                return false;
            }
        }

        return true;
    }
}

module.exports = Matcher;
