const _ = require('lodash');
const consola = require('consola');
const { getHostname, getDomain } = require('tldts');
const utils = require('./utils');

/**
 * Enumeration of the negative results
 */
const reasons = {
    WebsiteDown: 'WebsiteDown',
    NotFound: 'NotFound',
};

/**
 * Builds blocking rule for the specified rule
 *
 * @param {String} url - resource URL
 * @param {String} pageUrl - page URL
 * @param {Object} criteria - matching criteria
 * @returns {String} blocking rule
 */
function buildRule(url, pageUrl, criteria) {
    const ruleProperties = criteria.ruleProperties || {
        scope: 'domain',
    };

    if (!ruleProperties.modifiers) {
        ruleProperties.modifiers = [];
        if (utils.isThirdParty(url, pageUrl)) {
            ruleProperties.modifiers.push('third-party');
        }
    }

    let pattern;

    if (ruleProperties.scope === 'registeredDomain') {
        pattern = `||${getDomain(url)}^`;
    } else if (ruleProperties.scope === 'domainAndPath') {
        const u = new URL(url);
        pattern = `||${u.hostname}${u.pathname}`;
    } else {
        pattern = `||${getHostname(url)}^`;
    }

    let rule = pattern;
    for (let i = 0; i < ruleProperties.modifiers.length; i += 1) {
        if (i === 0) {
            rule += '$';
        } else {
            rule += ',';
        }
        rule += ruleProperties.modifiers[i];
    }

    return rule;
}

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
         *                  "criteria": "......matching criteria...."
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
     * @param {Object} criteria - criteria that was used to match this url
     */
    addPositiveResult(name, pageUrl, url, criteria) {
        const result = this.getOrCreateResult(name);

        consola.debug(`Positive: ${name} on ${pageUrl}: ${url}`);

        result.positive.push({
            pageUrl,
            url,
            criteria,
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
            reportTxt += '\n';

            if (value.positive.length > 0) {
                reportTxt += '\n';
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

            reportTxt += '\n';
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

            rules.push('! ------------------------------');
            rules.push(`! System: ${key}`);
            rules.push('! ------------------------------');

            const byPageUrl = {};
            value.positive.forEach((val) => {
                let matches = byPageUrl[val.pageUrl];
                if (!matches) {
                    matches = [];
                    byPageUrl[val.pageUrl] = matches;
                }
                matches.push({
                    url: val.url,
                    criteria: val.criteria,
                });
            });

            _.forOwn(byPageUrl, (matches, pageUrl) => {
                const pageRules = [];

                for (let i = 0; i < matches.length; i += 1) {
                    const { url, criteria } = matches[i];
                    const rule = buildRule(url, pageUrl, criteria);

                    if (rules.indexOf(rule) === -1) {
                        pageRules.push(rule);
                    }
                }

                if (pageRules.length > 0) {
                    rules.push(`! Found on: ${pageUrl}`);
                    _.uniq(pageRules).forEach((r) => rules.push(r));
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
