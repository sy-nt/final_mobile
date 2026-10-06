import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_exception.dart';

class ApiClient {
  ApiClient({
    required this.baseUrl,
    http.Client? httpClient,
  }) : _http = httpClient ?? http.Client();

  final String baseUrl;
  final http.Client _http;

  String? accessToken;
  String? refreshToken;
  void Function(String access, String refresh)? onTokensUpdated;
  Future<void> Function()? onUnauthorized;

  Future<T> delete<T>(String path) => _send<T>('DELETE', path);

  Future<T> get<T>(String path, {Map<String, String?>? query}) {
    return _send<T>('GET', path, query: query);
  }

  Future<T> patch<T>(String path, {Object? body}) {
    return _send<T>('PATCH', path, body: body);
  }

  Future<T> post<T>(String path, {Object? body, bool useRefreshToken = false}) {
    return _send<T>('POST', path, body: body, useRefreshToken: useRefreshToken);
  }

  Future<T> _send<T>(
    String method,
    String path, {
    Object? body,
    Map<String, String?>? query,
    bool useRefreshToken = false,
    bool retry = true,
  }) async {
    final uri = _uri(path, query);
    final headers = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    final token = useRefreshToken ? refreshToken : accessToken;
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    final request = http.Request(method, uri)
      ..headers.addAll(headers);
    if (body != null) request.body = jsonEncode(body);

    final streamed = await _http.send(request);
    final response = await http.Response.fromStream(streamed);
    if (response.statusCode == 401 && retry && !useRefreshToken) {
      if (refreshToken != null && refreshToken!.isNotEmpty) {
        final refreshed = await _refresh();
        if (refreshed) {
          return _send<T>(
            method,
            path,
            body: body,
            query: query,
            retry: false,
          );
        }
      }
      if (accessToken != null && accessToken!.isNotEmpty) {
        await onUnauthorized?.call();
      }
    }

    return _decode<T>(response);
  }

  T _decode<T>(http.Response response) {
    final raw = response.body.isEmpty ? <String, dynamic>{} : jsonDecode(response.body);
    if (raw is! Map<String, dynamic>) {
      throw ApiException('Unexpected response', statusCode: response.statusCode);
    }
    final statusCode = (raw['statusCode'] as num?)?.toInt() ?? response.statusCode;
    final message = (raw['message'] as String?) ?? 'Request failed';
    if (statusCode >= 400) {
      throw ApiException(message, statusCode: statusCode);
    }
    final data = raw['data'];
    return data as T;
  }

  Future<bool> _refresh() async {
    if (refreshToken == null || refreshToken!.isEmpty) return false;
    try {
      final data = await post<Map<String, dynamic>>(
        '/auth/refresh',
        useRefreshToken: true,
      );
      accessToken = data['accessToken'] as String;
      refreshToken = data['refreshToken'] as String;
      onTokensUpdated?.call(accessToken!, refreshToken!);
      return true;
    } on ApiException {
      return false;
    }
  }

  Uri _uri(String path, Map<String, String?>? query) {
    final filtered = <String, String>{};
    query?.forEach((key, value) {
      if (value != null && value.isNotEmpty) filtered[key] = value;
    });
    return Uri.parse('$baseUrl$path').replace(
      queryParameters: filtered.isEmpty ? null : filtered,
    );
  }
}
