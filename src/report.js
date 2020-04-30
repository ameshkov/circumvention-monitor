const _ = require('lodash');

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
     * Builds the report
     */
    build() {
        let reportTxt = '# Circumvention report\n\n';

        _.forOwn(this.report, (value, key) => {
            reportTxt += `### ${key}`;
            reportTxt += '\n\n';
            reportTxt += '#### Positive matches\n\n';
            reportTxt += '| Page | URL |\n';
            reportTxt += '| --- | --- |\n';

            value.positive.forEach((val) => {
                reportTxt += `| ${val.pageUrl} | ${val.url} |`;
                reportTxt += '\n';
            });

            reportTxt += '\n';
            reportTxt += '#### Negative matches\n\n';
            reportTxt += '| Page | Reason |\n';
            reportTxt += '| --- | --- |\n';

            value.negative.forEach((val) => {
                reportTxt += `| ${val.pageUrl} | ${val.reason} |`;
                reportTxt += '\n';
            });
        });

        return reportTxt;
    }
}

module.exports = {
    Report,
    reasons,
};
