// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'generic.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ServiceResponse _$ServiceResponseFromJson(Map<String, dynamic> json) =>
    ServiceResponse(
      code: json['code'] as num?,
      name: json['name'] as String?,
      message: json['message'] as String?,
      errors: parseDataObject(json['errors']),
      data: parseDataObject(json['data']),
      url: json['url'] as String?,
    );

Map<String, dynamic> _$ServiceResponseToJson(ServiceResponse instance) =>
    <String, dynamic>{
      'url': instance.url,
      'code': instance.code,
      'name': instance.name,
      'message': instance.message,
      'errors': instance.errors,
      'data': instance.data,
    };

DatabaseModel _$DatabaseModelFromJson(Map<String, dynamic> json) {
  return DatabaseModel();
}

Map<String, dynamic> _$DatabaseModelToJson(DatabaseModel instance) =>
    <String, dynamic>{};