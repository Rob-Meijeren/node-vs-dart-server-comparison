# `Node vs Dart server comparison`

## setup

run 
```bash
dart pub get
```
to get all dependencies

create the database according to the sql that is included at src/database/db.sql (on the node branch);

when done start up the server as defined below and first touch the /charge_locations/sync endpoint.
after this you can reach /charge_locations/ and actually get results

## Usage

You can run the API using:

```bash
dart run src/main.dart
```

To Export the mandatory fields for starting the service up locally
```
export PGSQL_HOST=<postgres ip>
export PGSQL_PORT=<postgres port (default is 5432)>
export PGSQL_DATABASE=<db name>
export PGSQL_USER=<postgres user>
export PGSQL_PASSWORD=<postgres user password>
```

If you have a local development cluster you can setup your postgresql connection details using environment variables.
Otherwise supply them using the command-line parameters.

If you get errors about missing ts-node and/or nodemon run `npm i` in the package folder.
