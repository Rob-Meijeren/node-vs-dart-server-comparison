import 'dart:convert';
import 'dart:async';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import 'package:shelf_router/shelf_router.dart';

import 'api/routes/charging/charge_locations.dart';
import 'database/datastore.dart';

Future main() async {
  final router = Router();

  String? dbHost = Platform.environment['PGSQL_HOST'];
  int? dbPort = int.tryParse(Platform.environment['PGSQL_PORT'] ?? '');
  String? dbName = Platform.environment['PGSQL_DATABASE'];
  String? dbUser = Platform.environment['PGSQL_USER'];
  String? dbPassword = Platform.environment['PGSQL_PASSWORD'];

  if (dbHost == null ||
      dbPort == null ||
      dbName == null ||
      dbUser == null ||
      dbPassword == null) {
    print('Missing PGSQL config');
    return;
  }

  final datastore = Datastore(dbHost, dbPort, dbName, dbUser, dbPassword);

  ChargeLocationController(router: router, datastore: datastore);

  await serveHandler(router);
}

/// Serves [handler] on [InternetAddress.anyIPv4] using the port returned by
/// [listenPort].
///
/// The returned [Future] will complete using [terminateRequestFuture] after
/// closing the server.
Future<void> serveHandler(Handler handler) async {
  final port = listenPort();

  final server = await shelf_io.serve(
    handler,
    InternetAddress.anyIPv4, // Allows external connections
    port,
  );
  print('Serving at http://${server.address.host}:${server.port}');

  await terminateRequestFuture();

  await server.close();
}

/// Returns the port to listen on from environment variable or uses the default
/// `8080`.
///
/// See https://cloud.google.com/run/docs/reference/container-contract#port
int listenPort() => int.parse(Platform.environment['PORT'] ?? '8888');

/// Returns a [Future] that completes when the process receives a
/// [ProcessSignal] requesting a shutdown.
///
/// [ProcessSignal.sigint] is listened to on all platforms.
///
/// [ProcessSignal.sigterm] is listened to on all platforms except Windows.
Future<void> terminateRequestFuture() {
  final completer = Completer<bool>.sync();

  // sigIntSub is copied below to avoid a race condition - ignoring this lint
  // ignore: cancel_subscriptions
  StreamSubscription? sigIntSub, sigTermSub;

  Future<void> signalHandler(ProcessSignal signal) async {
    print('Received signal $signal - closing');

    final subCopy = sigIntSub;
    if (subCopy != null) {
      sigIntSub = null;
      await subCopy.cancel();
      sigIntSub = null;
      if (sigTermSub != null) {
        await sigTermSub!.cancel();
        sigTermSub = null;
      }
      completer.complete(true);
    }
  }

  sigIntSub = ProcessSignal.sigint.watch().listen(signalHandler);

  // SIGTERM is not supported on Windows. Attempting to register a SIGTERM
  // handler raises an exception.
  if (!Platform.isWindows) {
    sigTermSub = ProcessSignal.sigterm.watch().listen(signalHandler);
  }

  return completer.future;
}
