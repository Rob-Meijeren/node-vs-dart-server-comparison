import 'dart:convert';

import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

import '../../../database/datastore.dart';
import '../../../database/tables/basic_table.dart';

class ChargeLocationController {
  String baseUrl = '/charge_locations';
  Datastore datastore;

  ChargeLocationController({required Router router, required this.datastore}) {
    router.get('$baseUrl', getChargeLocationsWithinCoordinates);
  }

  Future<Response> getChargeLocationsWithinCoordinates(Request request) async {
    String? southWest = request.url.queryParameters['southwest'];
    String? northEast = request.url.queryParameters['northeast'];

    List<WhereClauseArgument> latitudeWhere = [];
    List<WhereClauseArgument> longitudeWhere = [];

    if (southWest != null && northEast != null) {
      var splitNorthEastCoordinate = northEast.split(',');
      var nortEastLatitude = num.tryParse(splitNorthEastCoordinate[0]);
      var northEastLongitude = num.tryParse(splitNorthEastCoordinate[1]);
      var splitSouthWestCoordinate = southWest.split(',');
      var southWestLatitude = num.tryParse(splitSouthWestCoordinate[0]);
      var southWestLongitude = num.tryParse(splitSouthWestCoordinate[1]);

      latitudeWhere.add(WhereClauseArgument(
          'latitude', '>=', southWestLatitude, 'southWestLatitude'));
      latitudeWhere.add(WhereClauseArgument(
          'latitude', '<=', nortEastLatitude, 'northEastLatitude'));
      longitudeWhere.add(WhereClauseArgument(
          'longitude', '>=', southWestLongitude, 'southWestLongitude'));
      longitudeWhere.add(WhereClauseArgument(
          'longitude', '<=', northEastLongitude, 'norhEastLongitude'));
    }

    var whereClause = Map<String, List<WhereClauseArgument>>.from({});

    if (latitudeWhere.isNotEmpty) {
      whereClause.addEntries([
        MapEntry<String, List<WhereClauseArgument>>('latitude', latitudeWhere),
      ]);
    }

    if (longitudeWhere.isNotEmpty) {
      whereClause.addEntries([
        MapEntry<String, List<WhereClauseArgument>>(
            'longitude', longitudeWhere),
      ]);
    }

    var allChargeLocations = await datastore.chargeLocations
        .list(whereClause: whereClause.isNotEmpty ? whereClause : null);

    return Response.ok(jsonEncode(allChargeLocations),
        headers: {'content-type': 'application/json'});
  }
}
