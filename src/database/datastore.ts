import knex from 'knex';
import pg from 'pg';
import { isNaN } from 'lodash';
import { ChargeLocations } from './tables/charge_locations';

// Fix parsing of int8 values from postgres
// in theory they can be bigger then javascript integers hence they are
// returned as string
//
pg.types.setTypeParser(pg.types.builtins.INT8, (val) => {
  const intVal = parseInt(val, 10);
  return isNaN(intVal) ? val : intVal;
});

// this is done by following explanation by https://github.com/brianc/node-pg-types
//
pg.types.setTypeParser(pg.types.builtins.DATE, (val: string) => {
  return val === null ? null : new Date(val.split('T')[0]);
});

pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (val: string) => {
  return val === null ? null : new Date(val);
})

/**
 * Type to be used in a check if a certain id exists in a table
 *
 * @export
 * @interface IExistsCheck
 */
export interface IExistsCheck
{
  id: number;
  table: string;
  schema: string;
  found?: boolean;
}

/**
 * Provides access to the Postgress database and its entities
 *
 * @export
 * @class Datastore
 */
export class Datastore {

  /**
   * The KNEX query builder
   *
   * @type {knex}
   * @memberof Datastore
   */
  public pgsql: knex;

  /**
   * All the table operations
   *
   * @memberof Datastore
   */
  public chargeLocations: ChargeLocations;

  /**
   * Creates an instance of Datastore
   *
   * @param {string} host The database host
   * @param {string} databaseName The database name
   * @param {number} [port=5432] The TCP port for the database
   * @param {string} [username] The username for the database
   * @param {string} [password] The password for the database
   * @param {number} [poolMinimum=0] The minimum connection pool size
   * @param {number} [poolMaximum=5] The maximum connection pool size
   * @param {number} [transactionTimout=30000] The maximum connection pool size
   * @param {Mailer} [mailer] Instance of the mailer package
   * @memberof Datastore
   */
  constructor(
    host: string,
    databaseName: string,
    port: number = 5432,
    username?: string,
    password?: string,
    poolMinimum: number = 0,
    poolMaximum: number = 5,
    transactionTimout: number = 30000,
  ) {

    // Tables
    this.chargeLocations = new ChargeLocations(this);

    ////////////////////////////////////////////////////////////////////////////////
    // Connect to PGSQL
    ////////////////////////////////////////////////////////////////////////////////
    //
    console.log(`[PGSQL] Configuring ${host} ${port} ${databaseName} poolminmax: ${poolMinimum} ${poolMaximum}`);

    const config: knex.Config = {
      client: 'pg',
      connection: {
        host,
        password,
        charset:  'utf8',
        database: databaseName,
        port:     port || 5432,
        user:     username,
        ssl: false,
      },
      pool: {
        max:          poolMaximum,
        min:          poolMinimum,
      },
    };
    
    (config as any).afterCreate =  (conn: any, done: any) => {

      conn.connection.on('error', (err: any) => {
        console.log(`[PGSQL:POOL] Checking db error for eviction: ${err.message}`);

        // https://github.com/knex/documentation/issues/109#issuecomment-428338407
        if (err.message.match(/in a read-only transaction/)) {
          console.error(`[PGSQL:POOL] Error indicates bad connection, instructing Knex to dispose: ${err.message}`);
          conn.__knex__disposed = 'stale connection to read-only host';
        }
      });

      // Set the idle transaction timeout
      //
      const timeout = isNaN(transactionTimout) ? 30000 : transactionTimout;
      conn.query(`SET idle_in_transaction_session_timeout = ${timeout};`, (err: Error) => {
        done(err, conn);
      });
    },

    this.pgsql = knex(config);

    // Compose our API
    //
    // this.address = new Address(this);

    // Drain connection pool on shutdown
    //
    process.on('exit', () => {
      this.pgsql.destroy(() => console.log('[PGSQL] Shutdown due to EXIT'));
    });

    process.on('SIGINT', () => {
      this.pgsql.destroy(() => console.log('[PGSQL] Shutdown due to SIGINT'));
    });
  }

  /**
   * Connect to postgresql and test connection with a query
   *
   * @returns {Promise<boolean>}
   * @memberof Datastore
   */
  public async connect(): Promise<boolean> {

    await this.pgsql('chargemobile.charge_locations')
    .limit(1)
    .select()
    .column('id');

    console.log('[PGSQL] Connected');
    return true;
  }
}
