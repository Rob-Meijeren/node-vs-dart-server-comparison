import Knex from 'knex';
import { Datastore } from '../datastore';
import { omit, isNumber, first, get } from 'lodash';

export type TSortDirection = 'ASC' | 'DESC' | undefined;

export class BasicTable<T> {

  constructor(
    protected datastore: Datastore,
    protected schemaName: string,
    protected tableName: string,
    protected subjectName: string,
  ) {}

  /**
   * Return an entity from the database by id. Will reject with an error is missing
   * Does allow archived content to be retrieved
   *
   * @param {number} id The id of the entity
   * @param {knex.Transaction} [transaction] Optional transaction to use for the query
   * @returns {Promise<T>}
   * @memberof BasicTable
   */
  public async get(
    id: number,
    transaction?: Knex.Transaction,
  ): Promise<T> {
    if (!isNumber(id)) {
      throw {
        code: 400,
        message: 'Missing identifier',
        name: 'BAD_REQUEST',
      };
    }

    const queryBuilder = this.datastore.pgsql
      .withSchema(this.schemaName)
      .first('*')
      .from(this.tableName)
      .where('id', id);

    // Use transaction if provided
    //
    if (transaction) {
      queryBuilder.transacting(transaction);
    }

    const data: T = await queryBuilder as any;

    if (!data) {
      throw {
        name: 'NOT_FOUND',
        code: 404,
        message: `No ${this.subjectName} found for id: ${id}`,
      };
    }

    return data;
  }

  /**
   * Adds a new item to the database
   *
   * @param {T} data The details of the item to add
   * @param {knex.Transaction} [transaction] Optional transaction to use for the query
   * @returns {Promise<T>}
   * @memberof BasicTable
   */
  public async add(
    data: T,
    transaction?: Knex.Transaction,
  ): Promise<T> {
    // Prepare the data to omit special fields
    // Ensure data is handled as an array first
    //
    const newData = omit(data as any, ['id', 'created_at', 'updated_at']);

    const queryBuilder: Knex.QueryBuilder = this.datastore.pgsql
      .withSchema(this.schemaName)
      .table(this.tableName)
      .insert(newData, 'id');

    // Use transaction if provided
    //
    if (transaction) {
      queryBuilder.transacting(transaction);
    }

    const insertedIds: number[] = await queryBuilder;

    // Single add return new item
    //
    const item = await this.get(first(insertedIds) as number, transaction);
    return item;
  }

  /**
   * Returns a collection of items from the database.
   * You can use the optional where clause to filter the list
   *
   * @param {string} [sortField] The field to sort on
   * @param {('ASC'|'DESC')} [sortDirection='ASC'] The direction to sort in
   * @param {*} [whereClause] Optional filter containing key/values of the field values to filter on
   * @param {knex.Transaction} [transaction] Optional transaction to use for the query
   * @param {string|string[]} [columns] Optional the columns to select. Defaults to all columns
   * @returns {Promise<T[]>}
   * @memberof BasicTable
   */
  public async list(
    limit: number | undefined,
    skip: number | undefined,
    sortField?: string,
    sortDirection: TSortDirection = 'ASC',
    whereClause?: any,
    transaction?: Knex.Transaction,
    columns: string|string[] = '*',
  ): Promise<T[]> {
    const queryBuilder: Knex.QueryBuilder = this.datastore.pgsql
      .withSchema(this.schemaName)
      .select(columns as any)
      .from(this.tableName)

    if (whereClause) {
      queryBuilder.where(whereClause);
    }

    if (sortField) {
      queryBuilder.orderBy(sortField, sortDirection);
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (skip) {
      queryBuilder.offset(skip);
    }

    // Use transaction if provided
    //
    if (transaction) {
      queryBuilder.transacting(transaction);
    }

    const entries = await queryBuilder;

    return entries;
  }

  /**
   * Counts the number of items which can be used to determine total number of items for pagination
   * You can use the optional where clause to filter the count. Use the same where clause as your list as needed
   *
   * @param {*} [whereClause] Optional filter containing key/values of the field values to filter on
   * @param {knex.Transaction} [transaction] Optional transaction to use for the query
   * @returns {Promise<number>}
   * @memberof BasicTable
   */
     public async count(
      whereClause: any,
      transaction?: Knex.Transaction,
    ): Promise<number> {
      const queryBuilder: Knex.QueryBuilder = this.datastore.pgsql
        .withSchema(this.schemaName)
        .count()
        .from(this.tableName)
        .where(whereClause);

  
      // Use transaction if provided
      //
      if (transaction) {
        queryBuilder.transacting(transaction);
      }
  
      const rows = await queryBuilder;

      return get(rows, '0.count', 0);
    }

  /**
   * Updates an item in the database. You must supply the id on the data object.
   * This is a merge update so you can supply only the columns you want to change
   *
   * @param {T|any} data The (partial) details of the item to update
   * @param {knex.Transaction} [transaction] Optional transaction to use for the query
   * @returns {Promise<T>}
   * @memberof BasicTable
   */
  public async update(
    data: T | any,
    transaction?: Knex.Transaction,
    allowArchivedUpdate = false,
  ): Promise<T> {
    const itemId = parseInt(get(data, 'id'), 10);

    if (!isNumber(itemId)) {
      throw {
        code: 400,
        message: 'Missing identifier',
        name: 'BAD_REQUEST',
      };
    } else {
      const existingItem = await this.get(itemId, transaction);

      // Check if archived property exists and if true
      //
      if (!allowArchivedUpdate && (existingItem as any).archived !== undefined && (existingItem as any).archived === true) {
        throw {
          code: 410,
          message: 'Has been archived',
          name: 'GONE',
        };
      } else {
        const queryBuilder: Knex.QueryBuilder = this.datastore.pgsql
          .withSchema(this.schemaName)
          .table(this.tableName)
          .where('id', data.id)
          .update(omit(data, ['id', 'created_at', 'updated_at']), 'id');

        // Use transaction if provided
        //
        if (transaction) {
          queryBuilder.transacting(transaction);
        }

        const updatedIds: number[] = await queryBuilder;

        if (updatedIds.length > 1) {
          console.warn(`[PGSQL] Updated more then 1 ${this.subjectName}`, updatedIds, data);
        }

        const updatedItem = await this.get(data.id, transaction);

        return updatedItem;
      }
    }
  }
}