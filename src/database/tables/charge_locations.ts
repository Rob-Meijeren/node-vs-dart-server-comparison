import Knex from 'knex';
import { IChargeLocation } from '../../typings/database';
import { BasicTable } from './BasicTable';
import { Datastore } from '../datastore';

/**
 * Class implementing datastore methods for ChargeLocations
 *
 * @export
 * @class ChargeLocations
 * @extends {BasicTable<IChargeLocation>}
 */
export class ChargeLocations extends BasicTable<IChargeLocation> {
  /**
   * Creates an instance of ChargeLocations
   *
   * @param {Datastore} datastore Our datastore instance
   * @memberof ChargeLocations
   */
  constructor(protected datastore: Datastore) {
    super(datastore, 'node_vs_dart', 'charge_locations', 'charge locations');
  }

  async getByUUID(uuid: string, transaction?: Knex.Transaction): Promise<IChargeLocation[]> {
    const queryBuilder: Knex.QueryBuilder = this.datastore.pgsql
      .withSchema(this.schemaName)
      .select('*')
      .from(this.tableName)
      .where('uuid', '=', uuid);

    if (transaction) {
      queryBuilder.transacting(transaction);
    }

    const data = await queryBuilder;

    return data;
  }
}
