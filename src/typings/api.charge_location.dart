import 'package:json_annotation/json_annotation.dart';

import 'generic.dart';

part 'api.charge_location.g.dart';

@JsonSerializable()
class ChargeLocation extends DatabaseModel {
  int? id;
  String UUID;
  int? operator_id;
  String address_name;
  String address_line_1;
  String? address_line_2;
  String? address_city;
  String? address_state;
  String? address_postalcode;
  String address_country;
  num latitude;
  num longitude;
  String? contact_phone;
  String? contact_email;

  ChargeLocation({
    this.id,
    this.UUID = '',
    this.operator_id,
    this.address_name = '',
    this.address_line_1 = '',
    this.address_line_2,
    this.address_city,
    this.address_state,
    this.address_postalcode,
    this.address_country = '',
    this.latitude = 0,
    this.longitude = 0,
    this.contact_phone,
    this.contact_email,
  });

  factory ChargeLocation.fromJson(Map<String, dynamic> json) =>
      _$ChargeLocationFromJson(json);
  Map<String, dynamic> toJson() => _$ChargeLocationToJson(this);
}
