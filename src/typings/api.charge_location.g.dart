// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'api.charge_location.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ChargeLocation _$ChargeLocationFromJson(Map<String, dynamic> json) =>
    ChargeLocation(
      id: json['id'] as int?,
      UUID: json['UUID'] as String? ?? '',
      operator_id: json['operator_id'] as int?,
      address_name: json['address_name'] as String? ?? '',
      address_line_1: json['address_line_1'] as String? ?? '',
      address_line_2: json['address_line_2'] as String?,
      address_city: json['address_city'] as String?,
      address_state: json['address_state'] as String?,
      address_postalcode: json['address_postalcode'] as String?,
      address_country: json['address_country'] as String? ?? '',
      latitude: json['latitude'] as num? ?? 0,
      longitude: json['longitude'] as num? ?? 0,
      contact_phone: json['contact_phone'] as String?,
      contact_email: json['contact_email'] as String?,
    );

Map<String, dynamic> _$ChargeLocationToJson(ChargeLocation instance) =>
    <String, dynamic>{
      'id': instance.id,
      'UUID': instance.UUID,
      'operator_id': instance.operator_id,
      'address_name': instance.address_name,
      'address_line_1': instance.address_line_1,
      'address_line_2': instance.address_line_2,
      'address_city': instance.address_city,
      'address_state': instance.address_state,
      'address_postalcode': instance.address_postalcode,
      'address_country': instance.address_country,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'contact_phone': instance.contact_phone,
      'contact_email': instance.contact_email,
    };
