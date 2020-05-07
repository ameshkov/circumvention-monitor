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

    it('check building rules', () => {
        const report = new Report();
        report.addPositiveResult('test', 'https://example.org', 'https://example.com/script.js');
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
});
