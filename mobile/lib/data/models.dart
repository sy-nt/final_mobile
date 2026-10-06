DateTime? parseDate(dynamic value) {
  if (value == null) return null;
  if (value is DateTime) return value;
  return DateTime.tryParse(value.toString());
}

num? parseNum(dynamic value) {
  if (value == null) return null;
  if (value is num) return value;
  if (value is String) return num.tryParse(value);
  return null;
}

class PageResult<T> {
  const PageResult({
    required this.items,
    required this.lastId,
    required this.hasNextPage,
  });

  factory PageResult.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) parse,
  ) {
    final items = (json['items'] as List<dynamic>? ?? [])
        .map((item) => parse(item as Map<String, dynamic>))
        .toList();
    return PageResult(
      items: items,
      lastId: json['lastId'] as String? ?? '',
      hasNextPage: json['hasNextPage'] as bool? ?? false,
    );
  }

  final List<T> items;
  final String lastId;
  final bool hasNextPage;
}

class UserAccount {
  const UserAccount({
    required this.id,
    required this.email,
    this.firstName,
    this.lastName,
  });

  factory UserAccount.fromJson(Map<String, dynamic> json) {
    return UserAccount(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
    );
  }

  final String id;
  final String email;
  final String? firstName;
  final String? lastName;

  String get displayName {
    final parts = [
      firstName,
      lastName,
    ].whereType<String>().where((part) => part.trim().isNotEmpty);
    if (parts.isNotEmpty) return parts.join(' ');
    return email.split('@').first;
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'firstName': firstName,
        'lastName': lastName,
      };
}

class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      user: UserAccount.fromJson(json['user'] as Map<String, dynamic>),
    );
  }

  final String accessToken;
  final String refreshToken;
  final UserAccount user;
}

class Course {
  const Course({
    required this.id,
    required this.title,
    required this.visibility,
    required this.cloneCount,
    required this.isOwner,
    this.description,
    this.tags = const [],
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      visibility: json['visibility'] as String? ?? 'PRIVATE',
      cloneCount: parseNum(json['cloneCount'])?.toInt() ?? 0,
      isOwner: json['isOwner'] as bool? ?? false,
      tags: (json['tags'] as List<dynamic>? ?? []).map((item) => item.toString()).toList(),
    );
  }

  final String id;
  final String title;
  final String? description;
  final String visibility;
  final int cloneCount;
  final bool isOwner;
  final List<String> tags;
}

class ClonedCourse {
  const ClonedCourse({
    required this.id,
    required this.title,
    required this.visibility,
    this.description,
  });

  factory ClonedCourse.fromJson(Map<String, dynamic> json) {
    return ClonedCourse(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      visibility: json['visibility'] as String? ?? 'PRIVATE',
    );
  }

  final String id;
  final String title;
  final String? description;
  final String visibility;
}

class Flashcard {
  const Flashcard({
    required this.id,
    required this.wordEn,
    required this.wordVi,
    required this.position,
    this.example,
  });

  factory Flashcard.fromJson(Map<String, dynamic> json) {
    return Flashcard(
      id: json['id'] as String,
      wordEn: json['wordEn'] as String,
      wordVi: json['wordVi'] as String,
      example: json['example'] as String?,
      position: parseNum(json['position'])?.toInt() ?? 0,
    );
  }

  final String id;
  final String wordEn;
  final String wordVi;
  final String? example;
  final int position;
}

class Folder {
  const Folder({required this.id, required this.name});

  factory Folder.fromJson(Map<String, dynamic> json) {
    return Folder(id: json['id'] as String, name: json['name'] as String);
  }

  final String id;
  final String name;
}

class Tag {
  const Tag({required this.id, required this.name});

  factory Tag.fromJson(Map<String, dynamic> json) {
    return Tag(id: json['id'] as String, name: json['name'] as String);
  }

  final String id;
  final String name;
}

class Homework {
  const Homework({
    required this.id,
    required this.courseId,
    required this.type,
    required this.direction,
    this.questionCount,
    this.title,
  });

  factory Homework.fromJson(Map<String, dynamic> json) {
    return Homework(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      type: json['type'] as String,
      direction: json['direction'] as String,
      questionCount: parseNum(json['questionCount'])?.toInt(),
      title: json['title'] as String?,
    );
  }

  final String id;
  final String courseId;
  final String type;
  final String direction;
  final int? questionCount;
  final String? title;

  String get displayTitle {
    if (title != null && title!.isNotEmpty) return title!;
    final typeLabel = type == 'MULTIPLE_CHOICE' ? 'Multiple choice' : 'Write the word';
    return '$typeLabel · ${_directionLabel(direction)}';
  }
}

String _directionLabel(String direction) {
  switch (direction) {
    case 'EN_TO_VI':
      return 'EN → VI';
    case 'VI_TO_EN':
      return 'VI → EN';
    default:
      return 'Mixed';
  }
}

class QuizQuestion {
  const QuizQuestion({
    required this.flashcardId,
    required this.direction,
    required this.prompt,
    this.options,
  });

  factory QuizQuestion.fromJson(Map<String, dynamic> json) {
    return QuizQuestion(
      flashcardId: json['flashcardId'] as String,
      direction: json['direction'] as String,
      prompt: json['prompt'] as String,
      options: (json['options'] as List<dynamic>?)
          ?.map((item) => item.toString())
          .toList(),
    );
  }

  final String flashcardId;
  final String direction;
  final String prompt;
  final List<String>? options;
}

class StartAttempt {
  const StartAttempt({required this.attemptId, required this.questions});

  factory StartAttempt.fromJson(Map<String, dynamic> json) {
    return StartAttempt(
      attemptId: json['attemptId'] as String,
      questions: (json['questions'] as List<dynamic>? ?? [])
          .map((item) => QuizQuestion.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  final String attemptId;
  final List<QuizQuestion> questions;
}

class AttemptAnswer {
  const AttemptAnswer({
    required this.id,
    required this.expectedAnswer,
    required this.isCorrect,
    required this.questionDirection,
    required this.userAnswer,
    this.flashcardId,
  });

  factory AttemptAnswer.fromJson(Map<String, dynamic> json) {
    return AttemptAnswer(
      id: json['id'] as String,
      expectedAnswer: json['expectedAnswer'] as String,
      isCorrect: json['isCorrect'] as bool,
      questionDirection: json['questionDirection'] as String,
      userAnswer: json['userAnswer'] as String,
      flashcardId: json['flashcardId'] as String?,
    );
  }

  final String id;
  final String expectedAnswer;
  final bool isCorrect;
  final String questionDirection;
  final String userAnswer;
  final String? flashcardId;
}

class AttemptSummary {
  const AttemptSummary({
    required this.id,
    required this.status,
    required this.startedAt,
    required this.correctCount,
    required this.totalQuestions,
    this.completedAt,
    this.score,
  });

  factory AttemptSummary.fromJson(Map<String, dynamic> json) {
    return AttemptSummary(
      id: json['id'] as String,
      status: json['status'] as String,
      startedAt: parseDate(json['startedAt']) ?? DateTime.now(),
      completedAt: parseDate(json['completedAt']),
      correctCount: parseNum(json['correctCount'])?.toInt() ?? 0,
      totalQuestions: parseNum(json['totalQuestions'])?.toInt() ?? 0,
      score: parseNum(json['score'])?.toDouble(),
    );
  }

  final String id;
  final String status;
  final DateTime startedAt;
  final DateTime? completedAt;
  final int correctCount;
  final int totalQuestions;
  final double? score;
}

class AttemptDetail extends AttemptSummary {
  AttemptDetail({
    required super.id,
    required super.status,
    required super.startedAt,
    required super.correctCount,
    required super.totalQuestions,
    required this.answers,
    super.completedAt,
    super.score,
  });

  factory AttemptDetail.fromJson(Map<String, dynamic> json) {
    return AttemptDetail(
      id: json['id'] as String,
      status: json['status'] as String,
      startedAt: parseDate(json['startedAt']) ?? DateTime.now(),
      completedAt: parseDate(json['completedAt']),
      correctCount: parseNum(json['correctCount'])?.toInt() ?? 0,
      totalQuestions: parseNum(json['totalQuestions'])?.toInt() ?? 0,
      score: parseNum(json['score'])?.toDouble(),
      answers: (json['answers'] as List<dynamic>? ?? [])
          .map((item) => AttemptAnswer.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  final List<AttemptAnswer> answers;
}

class UserStat {
  const UserStat({
    required this.currentStreak,
    required this.longestStreak,
    required this.totalAttemptsCompleted,
    required this.totalCorrectAnswers,
    required this.totalPoints,
    this.lastActivityDate,
  });

  factory UserStat.fromJson(Map<String, dynamic> json) {
    return UserStat(
      currentStreak: parseNum(json['currentStreak'])?.toInt() ?? 0,
      longestStreak: parseNum(json['longestStreak'])?.toInt() ?? 0,
      lastActivityDate: parseDate(json['lastActivityDate']),
      totalAttemptsCompleted: parseNum(json['totalAttemptsCompleted'])?.toInt() ?? 0,
      totalCorrectAnswers: parseNum(json['totalCorrectAnswers'])?.toInt() ?? 0,
      totalPoints: parseNum(json['totalPoints'])?.toInt() ?? 0,
    );
  }

  final int currentStreak;
  final int longestStreak;
  final DateTime? lastActivityDate;
  final int totalAttemptsCompleted;
  final int totalCorrectAnswers;
  final int totalPoints;
}

class CourseShare {
  const CourseShare({
    required this.id,
    required this.courseId,
    required this.shareType,
    required this.status,
    this.sharedWithEmail,
  });

  factory CourseShare.fromJson(Map<String, dynamic> json) {
    return CourseShare(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      shareType: json['shareType'] as String,
      status: json['status'] as String,
      sharedWithEmail: json['sharedWithEmail'] as String?,
    );
  }

  final String id;
  final String courseId;
  final String shareType;
  final String status;
  final String? sharedWithEmail;
}

class ShareInvite {
  const ShareInvite({
    required this.id,
    required this.courseId,
    required this.courseTitle,
    required this.sharedByUserId,
  });

  factory ShareInvite.fromJson(Map<String, dynamic> json) {
    return ShareInvite(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      courseTitle: json['courseTitle'] as String,
      sharedByUserId: json['sharedByUserId'] as String,
    );
  }

  final String id;
  final String courseId;
  final String courseTitle;
  final String sharedByUserId;
}
