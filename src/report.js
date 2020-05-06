const _ = require('lodash');
const consola = require('consola');
const { getHostname } = require('tldts');

/**
 * Enumeration of the negative results
 */
const reasons = {
    WebsiteDown: 'WebsiteDown',
    NotFound: 'NotFound',
};

/**
 * The purpose of this class is to accumulate our script results
 * and then compose a human-readable report.
 */
class Report {
    constructor() {
        /**
         * Example of this object:
         * {
         *     "adsystem.com": {
         *          "positive": [
         *              {
         *                  "pageUrl": "https://example.org/",
         *                  "url": "https://adsystem.com/script.js"
         *              }
         *          ],
         *          "negative": [
         *              {
         *                  "pageUrl": "https://example.net/",
         *                  "reason": "Page is down"
         *              }
         *          ]
         *     }
         * }
         */
        this.report = {};
    }

    /**
     * Records a positive check result. It will be used later to build the report.
     *
     * @param {String} name - circumvention system name
     * @param {String} pageUrl - test page url
     * @param {String} url - url that matches the circumvention system criteria
     */
    addPositiveResult(name, pageUrl, url) {
        const result = this.getOrCreateResult(name);

        consola.debug(`Positive: ${name} on ${pageUrl}: ${url}`);

        result.positive.push({
            pageUrl,
            url,
        });
    }

    /**
     * Records a negative check result. It will be used later to build the report.
     *
     * @param {String} name - circumvention system name
     * @param {String} pageUrl - test page url
     * @param {String} reason - specific reason why the result is negative.
     *                          Reason must match {@see reasons}.
     * @throws {TypeError} if reason is not valid.
     */
    addNegativeResult(name, pageUrl, reason) {
        if (!reasons[reason]) {
            throw new TypeError(`${reason} is not a valid reason`);
        }

        consola.debug(`Negative: ${name} on ${pageUrl}: ${reason}`);

        const result = this.getOrCreateResult(name);
        result.negative.push({
            pageUrl,
            reason,
        });
    }

    /**
     * Gets or creates result object by name
     *
     * @param {String} name  - circumvention system name
     * @returns {*} result object
     */
    getOrCreateResult(name) {
        let result = this.report[name];

        if (!result) {
            result = {
                positive: [],
                negative: [],
            };
            this.report[name] = result;
        }

        return result;
    }

    /**
     * Returns an object with positive and negative results count:
     * {
     *  "postitive": 5,
     *  "negative": 1
     * }
     *
     * @returns {*} count of positive and negative results
     */
    count() {
        const cnt = {
            positive: 0,
            negative: 0,
        };

        _.forOwn(this.report, (value) => {
            cnt.positive += value.positive.length;
            cnt.negative += value.negative.length;
        });

        return cnt;
    }

    /**
     * Builds the report
     */
    build() {
        let reportTxt = '# Circumvention report\n\n';

        _.forOwn(this.report, (value, key) => {
            reportTxt += `### ${key}`;
            reportTxt += '\n\n';

            if (value.positive.length > 0) {
                reportTxt += '#### Positive matches\n\n';
                reportTxt += '| Page | URL |\n';
                reportTxt += '| --- | --- |\n';

                value.positive.forEach((val) => {
                    reportTxt += `| ${val.pageUrl} | ${val.url} |`;
                    reportTxt += '\n';
                });
            }

            if (value.negative.length > 0) {
                reportTxt += '\n';
                reportTxt += '#### Negative matches\n\n';
                reportTxt += '| Page | Reason |\n';
                reportTxt += '| --- | --- |\n';

                value.negative.forEach((val) => {
                    reportTxt += `| ${val.pageUrl} | ${val.reason} |`;
                    reportTxt += '\n';
                });
            }
        });

        return reportTxt;
    }

    /**
     * Build blocking rules for the positive results
     *
     * @returns {Array<String>} array with basic URL blocking rules
     */
    buildRules() {
        const rules = [];

        _.forOwn(this.report, (value, key) => {
            if (_.isEmpty(value.positive)) {
                return;
            }

            rules.push(`! System: ${key}`);
            rules.push('! ------------------------------');

            const byPageUrl = {};
            value.positive.forEach((val) => {
                let urls = byPageUrl[val.pageUrl];
                if (!urls) {
                    urls = [];
                    byPageUrl[val.pageUrl] = urls;
                }
                urls.push(val.url);
            });

            _.forOwn(byPageUrl, (urls, pageUrl) => {
                const pageRules = [];

                for (let i = 0; i < urls.length; i += 1) {
                    // TODO: Make modifiers configurable for this system
                    const rule = `||${getHostname(urls[i])}^$third-party`;
                    if (rules.indexOf(rule) === -1) {
                        pageRules.push(rule);
                    }
                }

                if (pageRules.length > 0) {
                    rules.push(`! Found on: ${pageUrl}`);
                    pageRules.forEach((r) => rules.push(r));
                }
            });
        });

        return rules;
    }
}

module.exports = {
    Report,
    reasons,
};
