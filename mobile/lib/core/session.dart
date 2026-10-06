import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../data/models.dart';
import 'api_client.dart';

class SessionController extends ChangeNotifier {
  SessionController({
    FlutterSecureStorage? storage,
    this.persist = true,
  }) : _storage = storage ?? const FlutterSecureStorage();

  static const _accessKey = 'access_token';
  static const _refreshKey = 'refresh_token';
  static const _userKey = 'user_json';

  final FlutterSecureStorage _storage;
  final bool persist;

  late ApiClient api;
  UserAccount? user;
  bool ready = false;

  bool get isLoggedIn => api.accessToken != null && api.accessToken!.isNotEmpty;

  void bindApi(ApiClient client) {
    api = client;
    api.onTokensUpdated = (access, refresh) {
      api.accessToken = access;
      api.refreshToken = refresh;
      _persistTokens();
    };
    api.onUnauthorized = logout;
  }

  Future<void> restore() async {
    if (persist) {
      api.accessToken = await _storage.read(key: _accessKey);
      api.refreshToken = await _storage.read(key: _refreshKey);
      final raw = await _storage.read(key: _userKey);
      if (raw != null) {
        user = UserAccount.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      }
    }
    ready = true;
    notifyListeners();
  }

  Future<void> applySession(AuthSession session) async {
    api.accessToken = session.accessToken;
    api.refreshToken = session.refreshToken;
    user = session.user;
    await _persistTokens();
    notifyListeners();
  }

  Future<void> updateUser(UserAccount next) async {
    user = next;
    if (persist) {
      await _storage.write(key: _userKey, value: jsonEncode(next.toJson()));
    }
    notifyListeners();
  }

  Future<void> logout() async {
    api.accessToken = null;
    api.refreshToken = null;
    user = null;
    if (persist) {
      await _storage.delete(key: _accessKey);
      await _storage.delete(key: _refreshKey);
      await _storage.delete(key: _userKey);
    }
    notifyListeners();
  }

  Future<void> _persistTokens() async {
    if (!persist) return;
    if (api.accessToken != null) {
      await _storage.write(key: _accessKey, value: api.accessToken);
    }
    if (api.refreshToken != null) {
      await _storage.write(key: _refreshKey, value: api.refreshToken);
    }
    if (user != null) {
      await _storage.write(key: _userKey, value: jsonEncode(user!.toJson()));
    }
  }
}
