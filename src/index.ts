import path from 'path';

// Setup global application root
//
(global as any).appRoot = path.resolve(__dirname);

import commander from 'commander';
import { API } from './api/index';

// Load package.json details
// This needs to happen after figuring out the appRoot path
//
import { packageInfo } from './pkg';
import { Datastore } from './database/datastore';

// Collect command-line options and arguments
//
commander
  .version(packageInfo.version)
  .usage('[options]')

  .option('--pg-host <value>', 'The postgresql host to connect to. Env: PGSQL_HOST')
  .option('--pg-port <n>', 'The postgresql host to connect to. Defaults to 5432. Env: PGSQL_PORT')
  .option('--pg-database <value>', 'The postgresql database to connect to. . Env: PGSQL_DATABASE')
  .option('--pg-user <value>', 'The postgresql user to login with. Env: PGSQL_USER')
  .option('--pg-password <value>', 'The postgresql password to login with. Env: PGSQL_PASSWORD')

  .parse(process.argv);

// Check required Postgresql configuration
//
const pgHost = commander.pgHost || process.env.PGSQL_HOST;
const pgPort = commander.pgPort || process.env.PGSQL_PORT || 5432;
const pgDatabase = commander.pgDatabase || process.env.PGSQL_DATABASE;
const pgUser = commander.pgUser || process.env.PGSQL_USER;
const pgPassword = commander.pgPassword || process.env.PGSQL_PASSWORD;
if (!pgHost || !pgDatabase || !pgUser || !pgPassword) {
  console.error('Missing PGSQL config');
  commander.help();
}

console.log('connecting', pgHost, pgPort, pgDatabase, pgUser);

////////////////////////////////////////////////////////////////////////////////
// Connect to datastore (PGSQL)
////////////////////////////////////////////////////////////////////////////////
//
export const datastore = new Datastore(
  pgHost,
  pgDatabase,
  pgPort,
  pgUser,
  pgPassword,
  parseInt(commander.pgPoolMin, 10) || undefined,
  parseInt(commander.pgPoolMax, 10) || undefined,
);

////////////////////////////////////////////////////////////////////////////////
// Expose API
////////////////////////////////////////////////////////////////////////////////
//
(async () => {
  console.info('[API] Starting up...');

  try {
    await datastore.connect().then(async () => {
      console.info('[API] Database available');
      // Start our express API
      //
      console.debug('[API] Starting API');
      const server = new API();
      server.start();
    });

  } catch (error) {
    console.error('[API] Failed to connect to database. Shutting down', error);
    process.exit(1);
  }
})();
