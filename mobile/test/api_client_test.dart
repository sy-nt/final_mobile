import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:input_info/core/api_client.dart';
import 'package:input_info/core/api_exception.dart';
import 'package:input_info/core/session.dart';
import 'package:input_info/data/models.dart';

class ScriptedClient extends http.BaseClient {
  ScriptedClient(this.responses);

  final List<http.Response> responses;
  final List<http.BaseRequest> requests = [];
  var _index = 0;

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    requests.add(request);
    final response = responses[_index++];
    return http.StreamedResponse(
      Stream<List<int>>.value(response.bodyBytes),
      response.statusCode,
      headers: {'content-type': 'application/json', ...response.headers},
    );
  }
}

http.Response jsonResponse(int status, Map<String, dynamic> body) {
  return http.Response(jsonEncode(body), status, headers: {
    'content-type': 'application/json',
  });
}

void main() {
  group('UserAccount', () {
    test('parses names and builds a display name', () {
      final user = UserAccount.fromJson({
        'id': '1',
        'email': 'ada@ink.test',
        'firstName': 'Ada',
        'lastName': 'Lovelace',
      });
      expect(user.displayName, 'Ada Lovelace');
    });

    test('falls back to email when names are missing', () {
      final user = UserAccount.fromJson({'id': '1', 'email': 'desk@ink.test'});
      expect(user.displayName, 'desk');
    });
  });

  group('AttemptSummary', () {
    test('parses numeric score from a postgres string', () {
      final summary = AttemptSummary.fromJson({
        'id': 'a1',
        'status': 'COMPLETED',
        'startedAt': '2026-10-07T00:00:00.000Z',
        'completedAt': '2026-10-07T00:01:00.000Z',
        'correctCount': 1,
        'totalQuestions': 1,
        'score': '100.00',
      });
      expect(summary.score, 100);
      expect(summary.correctCount, 1);
    });
  });

  group('ApiClient', () {
    test('unwraps the data envelope', () async {
      final httpClient = ScriptedClient([
        jsonResponse(200, {
          'data': {'currentStreak': 3, 'totalPoints': 40},
          'message': 'ok',
          'statusCode': 200,
        }),
      ]);
      final api = ApiClient(baseUrl: 'http://test/api/v1', httpClient: httpClient);
      api.accessToken = 'access';
      final data = await api.get<Map<String, dynamic>>('/me/stats');
      expect(data['currentStreak'], 3);
      expect(httpClient.requests.single.headers['Authorization'], 'Bearer access');
    });

    test('throws ApiException from error envelope', () async {
      final httpClient = ScriptedClient([
        jsonResponse(400, {
          'data': null,
          'message': 'A course can hold at most 200 flashcards',
          'statusCode': 400,
        }),
      ]);
      final api = ApiClient(baseUrl: 'http://test/api/v1', httpClient: httpClient);
      expect(
        () => api.post<dynamic>('/courses/1/flashcards', body: {}),
        throwsA(isA<ApiException>()),
      );
    });

    test('refreshes once on 401 then retries', () async {
      final httpClient = ScriptedClient([
        jsonResponse(401, {
          'data': null,
          'message': 'Unauthorized',
          'statusCode': 401,
        }),
        jsonResponse(200, {
          'data': {
            'accessToken': 'new-access',
            'refreshToken': 'new-refresh',
            'user': {
              'id': 'u1',
              'email': 'a@b.com',
              'firstName': 'Ada',
              'lastName': 'Lovelace',
            },
          },
          'message': 'ok',
          'statusCode': 200,
        }),
        jsonResponse(200, {
          'data': {'ok': true},
          'message': 'ok',
          'statusCode': 200,
        }),
      ]);
      final api = ApiClient(baseUrl: 'http://test/api/v1', httpClient: httpClient);
      api.accessToken = 'old-access';
      api.refreshToken = 'old-refresh';
      String? updatedAccess;
      api.onTokensUpdated = (access, refresh) => updatedAccess = access;

      final data = await api.get<Map<String, dynamic>>('/me/stats');
      expect(data['ok'], true);
      expect(updatedAccess, 'new-access');
      expect(httpClient.requests[1].url.path, '/api/v1/auth/refresh');
      expect(httpClient.requests[1].headers['Authorization'], 'Bearer old-refresh');
      expect(httpClient.requests[2].headers['Authorization'], 'Bearer new-access');
    });
  });

  group('SessionController', () {
    test('applySession and logout restore logged-in state', () async {
      final session = SessionController(persist: false);
      session.bindApi(ApiClient(baseUrl: 'http://test/api/v1'));
      await session.restore();
      expect(session.ready, isTrue);
      expect(session.isLoggedIn, isFalse);

      await session.applySession(
        const AuthSession(
          accessToken: 'a',
          refreshToken: 'r',
          user: UserAccount(
            id: '1',
            email: 'desk@ink.test',
            firstName: 'Ink',
            lastName: 'Desk',
          ),
        ),
      );
      expect(session.isLoggedIn, isTrue);
      expect(session.user?.email, 'desk@ink.test');
      expect(session.user?.displayName, 'Ink Desk');

      await session.logout();
      expect(session.isLoggedIn, isFalse);
      expect(session.user, isNull);
    });
  });
}
