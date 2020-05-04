const http = require('http');
const monitor = require('../src/monitor');

function createTestServer() {
    const server = http.createServer((req, res) => {
        if (req.url === '/script.js') {
            res.setHeader('Content-Type', 'text/javascript');
            res.write('/*test*/');
        } else {
            res.setHeader('Content-Type', 'text/html');
            res.write('<html><head><title>Test string</title><script src="/script.js"></script></head></html>');
        }
        res.end();
    });

    return server.listen(0);
}

describe('monitor', () => {
    it('check positive monitor website', async () => {
        const server = createTestServer();
        const { port } = server.address();

        // test configuration
        const configuration = {
            observe: [
                {
                    name: 'Test',
                    criteria: [
                        {
                            urlPattern: '/.*/',
                            contentPattern: '*test*',
                            contentType: 'script',
                            thirdParty: false,
                        },
                    ],
                    pages: [
                        `http://localhost:${port}/`,
                    ],
                },
            ],
        };

        const report = await monitor(configuration);

        expect(report).not.toBe(null);
        expect(report.count().positive).toBe(1);
        expect(report.count().negative).toBe(0);

        server.close();
    });

    it('check dead website', async () => {
        const server = createTestServer();
        const { port } = server.address();

        // test configuration
        const configuration = {
            observe: [
                {
                    name: 'Test',
                    criteria: [
                        {
                            urlPattern: '.*',
                            contentPattern: '.*test.*',
                            contentType: 'script',
                            thirdParty: true,
                        },
                    ],
                    pages: [
                        `http://localhost:${port}/`,
                    ],
                },
            ],
        };

        // Make sure that the server is dead and the website is not available
        server.close();

        const report = await monitor(configuration);

        expect(report).not.toBe(null);
        expect(report.count().positive).toBe(0);
        expect(report.count().negative).toBe(1);
    });
});
