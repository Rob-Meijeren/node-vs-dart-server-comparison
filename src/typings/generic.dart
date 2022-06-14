import 'dart:convert';

import 'package:json_annotation/json_annotation.dart';

part 'generic.g.dart';

dynamic parseDataObject(dynamic value) {
  if (value != null && value is String && value != 'null') {
    return Map<String, dynamic>.from(jsonDecode(value) as Map<String, dynamic>);
  } else if (value != null) {
    return value;
  } else if (value == null || value == 'null') {
    return null;
  }

  return jsonDecode(value);
}

@JsonSerializable()
class ServiceResponse {
  String? url;
  num? code;
  String? name;
  String? message;
  @JsonKey(fromJson: parseDataObject)
  dynamic? errors;
  @JsonKey(fromJson: parseDataObject)
  dynamic? data;

  ServiceResponse(
      {this.code, this.name, this.message, this.errors, this.data, this.url});

  factory ServiceResponse.fromJson(Map<String, dynamic> json) =>
      _$ServiceResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ServiceResponseToJson(this);
}

class ListResponse {
  int? limit;
  int? skip;
  int? total;

  ListResponse({this.limit, this.skip, this.total});
}

@JsonSerializable()
class DatabaseModel {

  DatabaseModel();

  factory DatabaseModel.fromJson(Map<String, dynamic> json) =>
      _$DatabaseModelFromJson(json);
  Map<String, dynamic> toJson() => _$DatabaseModelToJson(this);

  String onCreate() {
    return '';
  }
}
