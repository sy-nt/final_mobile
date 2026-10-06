class ApiException implements Exception {
  ApiException(this.message, {this.statusCode = 500});

  final String message;
  final int statusCode;

  @override
  String toString() => message;
}
