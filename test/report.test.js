const { Report, reasons } = require('../src/report');

describe('Report', () => {
    it('check building report', () => {
        const report = new Report();
        report.addPositiveResult('test', 'https://example.org', 'https://example.com/script.js');
        report.addNegativeResult('test', 'https://example.org', reasons.WebsiteDown);

        const reportTxt = report.build();

        const expected = `# Circumvention report

### test

#### Positive matches

| Page | URL |
| --- | --- |
| https://example.org | https://example.com/script.js |

#### Negative matches

| Page | Reason |
| --- | --- |
| https://example.org | WebsiteDown |

`;

        expect(reportTxt).toBe(expected);
    });

    it('check building simple rules', () => {
        const report = new Report();
        const criteria = {};
        report.addPositiveResult('test', 'https://example.org', 'https://example.com/script.js', criteria);
        report.addNegativeResult('test', 'https://example.org', reasons.WebsiteDown);

        const rules = report.buildRules();

        expect(rules).toStrictEqual([
            '! ------------------------------',
            '! System: test',
            '! ------------------------------',
            '! Found on: https://example.org',
            '||example.com^$third-party',
        ]);
    });

    it('check building rule with registeredDomain scope', () => {
        const report = new Report();
        const criteria = {
            ruleProperties: {
                scope: 'registeredDomain',
                modifiers: ['script'],
            },
        };
        report.addPositiveResult('test', 'https://example.org', 'https://test.example.com/test/script.js', criteria);

        const rules = report.buildRules();
        expect(rules).toStrictEqual([
            '! ------------------------------',
            '! System: test',
            '! ------------------------------',
            '! Found on: https://example.org',
            '||example.com^$script',
        ]);
    });

    it('check building rule with domainAndPath scope', () => {
        const report = new Report();
        const criteria = {
            ruleProperties: {
                scope: 'domainAndPath',
                modifiers: ['script'],
            },
        };
        report.addPositiveResult('test', 'https://example.org', 'https://test.example.com/script.js', criteria);

        const rules = report.buildRules();
        expect(rules).toStrictEqual([
            '! ------------------------------',
            '! System: test',
            '! ------------------------------',
            '! Found on: https://example.org',
            '||test.example.com/script.js$script',
        ]);
    });
});
