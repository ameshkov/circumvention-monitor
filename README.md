# Circumvention monitor

There's a typical issue with ad networks that often switch to using random new domains, and it's hard to keep an eye on them.
This crawler is supposed to automate this process.

- [Circumvention monitor](#circumvention-monitor)
  - [Reports](#reports)
  - [How to configure it](#how-to-configure-it)
  - [How to run it](#how-to-run-it)
  - [TODO](#todo)

## Reports

Every day the circumvention monitor runs automatically and generates two files:

* [report/report.md](report/report.md) - human-readable report.
* [report/rules.txt](report/rules.txt) - blocking rules for the domains discovered by the crawler.

## How to configure it

In order to add a new ad system to monitor, add a new JS object to the [configuration](conf/configuration.json).

```json
{
    "name": "AD SYSTEM NAME",
    "criteria": [
        {
            "urlPattern": "URL PATTERN",
            "contentPattern": "CONTENT PATTERN",
            "contentType": "script",
            "thirdParty": true
        }
    ],
    "pages": [
        "https://example.net/",
        "https://example.com/",
    ]
}
```

* `name` - ad system name. Will be used in the report to identify this ruleset.
* `criteria` - a list of criteria that will be used to identify ad requests.
  * `urlPattern` *(optional)* - ad request URL must match this pattern. It can be a string, a wildcard, or a regular expression.
    
    Examples:
    
    * `test` - string, all URLs that contain this string.
    * `*test*test*` - wildcard, the URL must match this wildcard.
    * `/.*test.*/` - regular expression. Note that `/` are just special characters and not a part of the regular expression.
  * `contentPattern` *(optional)* - response content must match this pattern. Just like `urlPattern`, it can be a string, a wildcard, or a regular expression.
  * `contentType` *(optional)* - one of this [list](https://github.com/puppeteer/puppeteer/blob/v3.0.2/docs/api.md#requestresourcetype).
  * `thirdParty` *(optional)* - if specified, we check if request is third party or not.
* `pages` - a list of webpages that will be crawled in order to extract this ad system domains.

## How to run it

* `yarn install` - install dependencies
* `yarn monitor` - run the crawler with default arguments

Run `yarn monitor -v` to make it print the verbose log.

## TODO

* [ ] Make basic rules modifiers configurable (see report.js)