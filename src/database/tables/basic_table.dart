import 'package:postgres/postgres.dart';

import '../../typings/api.charge_location.dart';
import '../../typings/generic.dart';
import '../datastore.dart';

class WhereClauseArgument {
  String field;
  String operator;
  dynamic value;
  String fieldParamName;

  WhereClauseArgument(
      this.field, this.operator, this.value, this.fieldParamName);
}

class WhereClause {
  String sql;
  Map<String, dynamic> argumentsMap;

  WhereClause({required this.sql, required this.argumentsMap});
}

/// Add factory functions for every Type and every constructor you want to make available to `make`
final factories = <Type, Function>{
  ChargeLocation: (Map<String, dynamic> json) => ChargeLocation.fromJson(json)
};

class BasicTable<T extends DatabaseModel> {
  late Datastore datastore;
  late String schemaName;
  late String tableName;
  late String subjectName;

  BasicTable(
    this.datastore,
    this.schemaName,
    this.tableName,
    this.subjectName,
  );

  /// Return an entity from the database by id. Will reject with an error is missing
  /// Does allow archived content to be retrieved
  ///
  /// @param {number} id The id of the entity
  /// @param {knex.Transaction} [transaction] Optional transaction to use for the query
  /// @returns {Promise<T>}
  /// @memberof BasicTable
  Future<T> get(num id, {PostgreSQLExecutionContext? transaction}) async {
    var sql = 'SELECT * FROM $schemaName.$tableName WHERE id = @idParam';

    List<List<dynamic>> result;

    Map<String, dynamic> subValues = {"idParam": id};

    if (transaction != null) {
      result = await transaction.query(sql, substitutionValues: subValues);
    } else {
      result = await datastore.dbConnection
          .query(sql, substitutionValues: subValues);
    }

    if (result.isEmpty) {
      throw ServiceResponse(
        code: 404,
        name: 'NOT_FOUND',
        message: 'No $subjectName found for id $id',
      );
    }

    T firstResult = result[0] as T;

    return firstResult;
  }

  /// Returns a collection of items from the database.
  /// You can use the optional where clause to filter the list
  ///
  /// @param {string} [sortField] The field to sort on
  /// @param {('ASC'|'DESC')} [sortDirection='ASC'] The direction to sort in
  /// @param {*} [whereClause] Optional filter containing key/values of the field values to filter on
  /// @param {knex.Transaction} [transaction] Optional transaction to use for the query
  /// @param {string|string[]} [columns] Optional the columns to select. Defaults to all columns
  /// @returns {Promise<T[]>}
  /// @memberof BasicTable
  Future<List<T>> list({
    num? limit,
    num? skip,
    String? sortField,
    String sortDirection = 'ASC',
    Map<String, List<WhereClauseArgument>>? whereClause,
    PostgreSQLExecutionContext? transaction,
    List<String> columns = const <String>['*'],
  }) async {
    String sql = 'SELECT ${columns.join(', ')} FROM $schemaName.$tableName';

    WhereClause? parsedWhereClause;
    if (whereClause != null) {
      parsedWhereClause = _createWhereClause(whereClause);
      sql += ' WHERE ${parsedWhereClause.sql}';
    }

    if (sortField != null) {
      sql += ' ORDER BY $sortField $sortDirection';
    }

    if (limit != null) {
      sql += ' LIMIT $limit';
    }

    if (skip != null) {
      sql += ' OFFSET $skip';
    }

    PostgreSQLResult result;

    if (transaction != null) {
      result = await transaction.query(sql,
          substitutionValues: parsedWhereClause?.argumentsMap);
    } else {
      result = await datastore.dbConnection
          .query(sql, substitutionValues: parsedWhereClause?.argumentsMap);
    }

    List<T> typedResults = [];

    for (var row in result) {
      var parsedRow = factories[T]!(row.toColumnMap());
      typedResults.add(parsedRow);
    }

    return typedResults;
  }

  WhereClause _createWhereClause(
      Map<String, List<WhereClauseArgument>> whereClauseMap) {
    String whereClause = '';
    Map<String, dynamic> whereClauseArguments = {};

    whereClauseMap.forEach((String key, List<WhereClauseArgument> value) {
      if (key == 'or-clause') {
        var whereClauseStringAdditions = List<String>.from([]);

        for (var argument in value) {
          var whereClauseAddition = _createWhereClauseArgument(argument);
          if (whereClauseAddition[0] != null &&
              whereClauseAddition[0] != '' &&
              whereClauseAddition[1] != null) {
            whereClauseStringAdditions.add(whereClauseAddition[0]);

            whereClauseArguments.addEntries([
              MapEntry<String, dynamic>(argument.fieldParamName, whereClauseAddition[1]),
            ]);
          }
        }

        var stringifiedWhereClauseStringAddition =
            '(${whereClauseStringAdditions.join(' OR ')})';

        if (stringifiedWhereClauseStringAddition != '()' && whereClause == '') {
          whereClause += stringifiedWhereClauseStringAddition;
        } else if (stringifiedWhereClauseStringAddition != '()' &&
            whereClause != '') {
          whereClause += ' AND $stringifiedWhereClauseStringAddition';
        }
      } else {
        var whereClauseStringAdditions = List<String>.from([]);
        for (var argument in value) {
          var whereClauseAddition = _createWhereClauseArgument(argument);

          if (whereClauseAddition[0] != null &&
              whereClauseAddition[0] != '' &&
              whereClauseAddition[1] != null) {
            whereClauseStringAdditions.add(whereClauseAddition[0]);
            whereClauseArguments.addEntries([
              MapEntry<String, dynamic>(argument.fieldParamName, whereClauseAddition[1]),
            ]);
          }
        }

        if (whereClause == '') {
          whereClause += '(${whereClauseStringAdditions.join(' AND ')})';
        } else if (whereClause != '') {
          whereClause += ' AND (${whereClauseStringAdditions.join(' AND ')})';
        }
      }
    });

    return WhereClause(sql: whereClause, argumentsMap: whereClauseArguments);
  }

  List<dynamic> _createWhereClauseArgument(WhereClauseArgument argument) {
    var whereClauseAddition = '${argument.field} ${argument.operator} @${argument.fieldParamName}';
    var whereClauseArgument = '${argument.value}';

    return List<dynamic>.from([whereClauseAddition, whereClauseArgument],
        growable: false);
  }
}
