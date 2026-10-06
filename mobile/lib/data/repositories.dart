import '../core/api_client.dart';
import 'models.dart';

class AuthRepository {
  AuthRepository(this._api);
  final ApiClient _api;

  Future<void> deleteAccount() => _api.delete<dynamic>('/user');

  Future<UserAccount> getMe() async {
    final data = await _api.get<Map<String, dynamic>>('/user/me');
    return UserAccount.fromJson(data);
  }

  Future<AuthSession> login(String email, String password) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/auth/login',
      body: {'email': email, 'password': password},
    );
    return AuthSession.fromJson(data);
  }

  Future<AuthSession> register({
    required String email,
    required String firstName,
    required String lastName,
    required String password,
  }) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/user',
      body: {
        'email': email,
        'firstName': firstName,
        'lastName': lastName,
        'password': password,
      },
    );
    return AuthSession.fromJson(data);
  }

  Future<UserAccount> updateMe({String? email, String? password}) async {
    final body = <String, String>{};
    if (email != null) body['email'] = email;
    if (password != null) body['password'] = password;
    final data = await _api.patch<Map<String, dynamic>>('/user', body: body);
    return UserAccount.fromJson(data);
  }
}

class CourseRepository {
  CourseRepository(this._api);
  final ApiClient _api;

  Future<ClonedCourse> cloneCourse(String id) async {
    final data = await _api.post<Map<String, dynamic>>('/courses/$id/clone');
    return ClonedCourse.fromJson(data);
  }

  Future<Course> create({required String title, String? description}) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/courses',
      body: {
        'title': title,
        if (description != null && description.isNotEmpty) 'description': description,
      },
    );
    return Course.fromJson(data);
  }

  Future<void> delete(String id) => _api.delete<dynamic>('/courses/$id');

  Future<Course> getById(String id) async {
    final data = await _api.get<Map<String, dynamic>>('/courses/$id');
    return Course.fromJson(data);
  }

  Future<PageResult<Course>> list({String? lastId, String? folderId}) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/courses',
      query: {'lastId': lastId, 'folderId': folderId, 'limit': '30'},
    );
    return PageResult.fromJson(data, Course.fromJson);
  }

  Future<PageResult<Course>> gallery({
    String? lastId,
    String? title,
    String? tag,
  }) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/courses/gallery',
      query: {
        'lastId': lastId,
        'title': title,
        'tag': tag,
        'limit': '30',
      },
    );
    return PageResult.fromJson(data, Course.fromJson);
  }

  Future<Course> update(
    String id, {
    String? title,
    String? description,
    String? visibility,
  }) async {
    final body = <String, String>{};
    if (title != null) body['title'] = title;
    if (description != null) body['description'] = description;
    if (visibility != null) body['visibility'] = visibility;
    final data = await _api.patch<Map<String, dynamic>>('/courses/$id', body: body);
    return Course.fromJson(data);
  }
}

class FlashcardRepository {
  FlashcardRepository(this._api);
  final ApiClient _api;

  Future<Flashcard> create(
    String courseId, {
    required String wordEn,
    required String wordVi,
    String? example,
  }) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/courses/$courseId/flashcards',
      body: {
        'wordEn': wordEn,
        'wordVi': wordVi,
        if (example != null && example.isNotEmpty) 'example': example,
      },
    );
    return Flashcard.fromJson(data);
  }

  Future<void> delete(String courseId, String id) {
    return _api.delete<dynamic>('/courses/$courseId/flashcards/$id');
  }

  Future<List<Flashcard>> list(String courseId) async {
    final data = await _api.get<List<dynamic>>('/courses/$courseId/flashcards');
    return data
        .map((item) => Flashcard.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<String?> suggest({required String from, required String text}) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/translate/suggest',
      query: {'from': from, 'text': text},
    );
    return data['translation'] as String?;
  }

  Future<Flashcard> update(
    String courseId,
    String id, {
    String? wordEn,
    String? wordVi,
    String? example,
  }) async {
    final data = await _api.patch<Map<String, dynamic>>(
      '/courses/$courseId/flashcards/$id',
      body: {
        'wordEn': ?wordEn,
        'wordVi': ?wordVi,
        'example': ?example,
      },
    );
    return Flashcard.fromJson(data);
  }
}

class FolderRepository {
  FolderRepository(this._api);
  final ApiClient _api;

  Future<void> addCourse(String folderId, String courseId) {
    return _api.post<dynamic>(
      '/folders/$folderId/courses',
      body: {'courseId': courseId},
    );
  }

  Future<Folder> create(String name) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/folders',
      body: {'name': name},
    );
    return Folder.fromJson(data);
  }

  Future<void> delete(String id) => _api.delete<dynamic>('/folders/$id');

  Future<List<Folder>> list() async {
    final data = await _api.get<List<dynamic>>('/folders');
    return data
        .map((item) => Folder.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> removeCourse(String folderId, String courseId) {
    return _api.delete<dynamic>('/folders/$folderId/courses/$courseId');
  }

  Future<Folder> rename(String id, String name) async {
    final data = await _api.patch<Map<String, dynamic>>(
      '/folders/$id',
      body: {'name': name},
    );
    return Folder.fromJson(data);
  }
}

class TagRepository {
  TagRepository(this._api);
  final ApiClient _api;

  Future<Tag> attach(String courseId, String name) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/courses/$courseId/tags',
      body: {'name': name},
    );
    return Tag.fromJson(data);
  }

  Future<void> detach(String courseId, String tagId) {
    return _api.delete<dynamic>('/courses/$courseId/tags/$tagId');
  }

  Future<List<Tag>> courseTags(String courseId) async {
    final data = await _api.get<List<dynamic>>('/courses/$courseId/tags');
    return data.map((item) => Tag.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<Tag>> search(String? query) async {
    final data = await _api.get<List<dynamic>>(
      '/tags',
      query: {'search': query},
    );
    return data.map((item) => Tag.fromJson(item as Map<String, dynamic>)).toList();
  }
}

class HomeworkRepository {
  HomeworkRepository(this._api);
  final ApiClient _api;

  Future<AttemptSummary> complete(String homeworkId, String attemptId) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/homeworks/$homeworkId/attempts/$attemptId/complete',
    );
    return AttemptSummary.fromJson(data);
  }

  Future<Homework> create({
    required String courseId,
    required String type,
    String? direction,
    int? questionCount,
    String? title,
  }) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/homeworks',
      body: {
        'courseId': courseId,
        'type': type,
        'direction': ?direction,
        'questionCount': ?questionCount,
        if (title != null && title.isNotEmpty) 'title': title,
      },
    );
    return Homework.fromJson(data);
  }

  Future<void> delete(String id) => _api.delete<dynamic>('/homeworks/$id');

  Future<AttemptDetail> getAttempt(String homeworkId, String attemptId) async {
    final data = await _api.get<Map<String, dynamic>>(
      '/homeworks/$homeworkId/attempts/$attemptId',
    );
    return AttemptDetail.fromJson(data);
  }

  Future<List<Homework>> list({String? courseId}) async {
    final data = await _api.get<List<dynamic>>(
      '/homeworks',
      query: {'courseId': courseId},
    );
    return data
        .map((item) => Homework.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<StartAttempt> start(String homeworkId) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/homeworks/$homeworkId/attempts',
    );
    return StartAttempt.fromJson(data);
  }

  Future<AttemptAnswer> submit({
    required String homeworkId,
    required String attemptId,
    required String flashcardId,
    required String direction,
    required String userAnswer,
  }) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/homeworks/$homeworkId/attempts/$attemptId/answers',
      body: {
        'flashcardId': flashcardId,
        'direction': direction,
        'userAnswer': userAnswer,
      },
    );
    return AttemptAnswer.fromJson(data);
  }
}

class ShareRepository {
  ShareRepository(this._api);
  final ApiClient _api;

  Future<ClonedCourse> accept(String shareId) async {
    final data = await _api.post<Map<String, dynamic>>('/shares/$shareId/accept');
    return ClonedCourse.fromJson(data);
  }

  Future<CourseShare> create(
    String courseId, {
    required String shareType,
    String? email,
  }) async {
    final data = await _api.post<Map<String, dynamic>>(
      '/courses/$courseId/shares',
      body: {
        'shareType': shareType,
        'email': ?email,
      },
    );
    return CourseShare.fromJson(data);
  }

  Future<List<ShareInvite>> invites() async {
    final data = await _api.get<List<dynamic>>('/shares/invites');
    return data
        .map((item) => ShareInvite.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<CourseShare>> list(String courseId) async {
    final data = await _api.get<List<dynamic>>('/courses/$courseId/shares');
    return data
        .map((item) => CourseShare.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> report(
    String courseId, {
    required String reason,
    String? detail,
  }) {
    return _api.post<dynamic>(
      '/courses/$courseId/reports',
      body: {
        'reason': reason,
        if (detail != null && detail.isNotEmpty) 'detail': detail,
      },
    );
  }

  Future<void> revoke(String courseId, String shareId) {
    return _api.delete<dynamic>('/courses/$courseId/shares/$shareId');
  }
}

class StatRepository {
  StatRepository(this._api);
  final ApiClient _api;

  Future<UserStat> mine() async {
    final data = await _api.get<Map<String, dynamic>>('/me/stats');
    return UserStat.fromJson(data);
  }
}

class AppRepositories {
  AppRepositories(ApiClient api)
      : auth = AuthRepository(api),
        courses = CourseRepository(api),
        flashcards = FlashcardRepository(api),
        folders = FolderRepository(api),
        tags = TagRepository(api),
        homeworks = HomeworkRepository(api),
        shares = ShareRepository(api),
        stats = StatRepository(api);

  final AuthRepository auth;
  final CourseRepository courses;
  final FlashcardRepository flashcards;
  final FolderRepository folders;
  final TagRepository tags;
  final HomeworkRepository homeworks;
  final ShareRepository shares;
  final StatRepository stats;
}
