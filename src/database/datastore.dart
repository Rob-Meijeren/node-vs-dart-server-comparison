import 'package:postgres/postgres.dart';

import 'tables/charge_locations.dart';

class Datastore {
  late PostgreSQLConnection dbConnection;

  late ChargeLocationsDatastore chargeLocations;

  Datastore(
      String host, int port, String db, String username, String password) {
    connect(host, port, db, username, password);

    chargeLocations = ChargeLocationsDatastore(this);
  }

  connect(String host, int port, String db, String username,
      String password) async {
    dbConnection = PostgreSQLConnection(host, port, db,
        username: username, password: password);
    await dbConnection.open();
  }
}
