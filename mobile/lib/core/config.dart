import 'dart:io';

class AppConfig {
  static String get apiBaseUrl {
    const fromEnv = String.fromEnvironment('API_BASE_URL');
    if (fromEnv.isNotEmpty) return fromEnv;
    if (Platform.isAndroid) return 'http://127.0.0.1:3000/api/v1';
    return 'http://127.0.0.1:3000/api/v1';
  }
}
