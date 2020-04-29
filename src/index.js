const consola = require('consola');
const packageJson = require('../package.json');

/**
 * Entry point
 */
async function main() {
    consola.info(`Starting ${packageJson.name} v${packageJson.version}`);

    consola.info(`Finished ${packageJson.name}`);
}

main();
