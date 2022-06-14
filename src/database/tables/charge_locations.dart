import '../../typings/api.charge_location.dart';
import '../datastore.dart';
import 'basic_table.dart';

class ChargeLocationsDatastore extends BasicTable<ChargeLocation> {
  ChargeLocationsDatastore(Datastore datastore)
      : super(
            datastore, 'node_vs_dart', 'charge_locations', 'charge locations');
}
