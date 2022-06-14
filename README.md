# `Node vs Dart server comparison`

## setup

create the database according to the sql that is included at src/database/db.sql;

when done start up the server as defined below and first touch the /charge_locations/sync endpoint.
after this you can reach /charge_locations/ and actually get results

## Usage

You can run the API using:

```bash
# Run with ts-node
npm run start

# Run with ts-node and debugger
npm run start:debug

# Live development using nodemon and TS sources
npm run watch
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
