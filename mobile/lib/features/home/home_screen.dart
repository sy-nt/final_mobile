import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/session.dart';
import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../library/review_screen.dart';
import '../practice/attempt_screen.dart';
import '../practice/quiz_setup_sheet.dart';
import '../shell/main_shell.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  UserStat? _stats;
  List<ShareInvite> _invites = [];
  List<Homework> _homeworks = [];
  List<Course> _courses = [];
  Object? _error;
  bool _loading = true;
  int? _tabIndex;
  int _loadToken = 0;

  AppRepositories get _repos => context.read<AppRepositories>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _load();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final index = ShellTabIndex.of(context);
    final returnedToHome = _tabIndex != null && _tabIndex != 0 && index == 0;
    _tabIndex = index;
    if (returnedToHome) _load();
  }

  Future<void> _load() async {
    final token = ++_loadToken;
    if (_stats == null) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final stats = await _repos.stats.mine();
      final invites = await _repos.shares.invites();
      final homeworks = await _repos.homeworks.list();
      final courses = await _repos.courses.list();
      if (!mounted || token != _loadToken) return;
      setState(() {
        _stats = stats;
        _invites = invites;
        _homeworks = homeworks;
        _courses = courses.items;
        _loading = false;
        _error = null;
      });
    } catch (error) {
      if (!mounted || token != _loadToken) return;
      setState(() {
        _error = error;
        _loading = false;
      });
    }
  }

  Future<void> _accept(ShareInvite invite) async {
    try {
      final cloned = await _repos.shares.accept(invite.id);
      if (!mounted) return;
      showCopiedDesk(
        context,
        title: cloned.title,
        onOpen: () => context.push('/courses/${cloned.id}'),
        onReview: () => _reviewCourse(cloned.id),
      );
      await _load();
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _reviewCourse(String courseId) async {
    try {
      final cards = await _repos.flashcards.list(courseId);
      if (!mounted || cards.isEmpty) return;
      await Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ReviewScreen(cards: cards)),
      );
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _quizCourse(Course course) async {
    try {
      final cards = await _repos.flashcards.list(course.id);
      if (!mounted) return;
      if (cards.isEmpty) {
        showError(context, 'Add cards before starting a quiz');
        return;
      }
      final homework = await showQuizSetupSheet(context, course.id, cards.length);
      if (homework == null || !mounted) return;
      final started = await _repos.homeworks.start(homework.id);
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => AttemptScreen(
            homeworkId: homework.id,
            courseId: course.id,
            started: started,
          ),
        ),
      );
      await _load();
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _startHomework(Homework homework) async {
    try {
      final started = await _repos.homeworks.start(homework.id);
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => AttemptScreen(
            homeworkId: homework.id,
            courseId: homework.courseId,
            started: started,
          ),
        ),
      );
      await _load();
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _studyPicker() async {
    if (_courses.isEmpty) {
      context.go('/library');
      return;
    }
    final course = await showModalBottomSheet<Course>(
      context: context,
      builder: (context) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Text('Study a deck', style: Theme.of(context).textTheme.titleLarge),
            ),
            ..._courses.map(
              (course) => ListTile(
                title: Text(course.title),
                onTap: () => Navigator.pop(context, course),
              ),
            ),
          ],
        ),
      ),
    );
    if (course == null || !mounted) return;
    await context.push('/courses/${course.id}');
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionController>();
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null) {
      return Scaffold(body: ErrorView(message: _error.toString(), onRetry: _load));
    }
    final stats = _stats!;
    return Scaffold(
      appBar: AppBar(
        title: Text('Good study, ${session.user?.displayName ?? 'learner'}'),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            if (_invites.isNotEmpty) ...[
              Text('Waiting on the blotter', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              ..._invites.map(
                (invite) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: PaperCard(
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            invite.courseTitle,
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                        ),
                        FilledButton(
                          onPressed: () => _accept(invite),
                          child: const Text('Accept'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
            PaperCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Desk lamp', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 6),
                  const Text(
                    'Keep the lamp lit. A completed quiz today extends the streak.',
                    style: TextStyle(color: InkColors.muted),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      LampStat(label: 'Streak', value: '${stats.currentStreak}'),
                      LampStat(label: 'Best', value: '${stats.longestStreak}'),
                      LampStat(label: 'Points', value: '${stats.totalPoints}'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _studyPicker,
                      child: Text(_courses.isEmpty ? 'Make a deck' : 'Study a deck'),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text('Study today', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            if (_courses.isEmpty)
              PaperCard(
                onTap: () => context.go('/library'),
                child: const Text('No decks yet. Copy one from Discover or make your own.'),
              )
            else
              ..._courses.take(6).map(
                    (course) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(course.title),
                      subtitle: Text(
                        course.description == null || course.description!.isEmpty
                            ? 'Review or quiz'
                            : course.description!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          TextButton(
                            onPressed: () => _reviewCourse(course.id),
                            child: const Text('Review'),
                          ),
                          TextButton(
                            onPressed: () => _quizCourse(course),
                            child: const Text('Quiz'),
                          ),
                        ],
                      ),
                    ),
                  ),
            const SizedBox(height: 24),
            Text('Saved quizzes', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            if (_homeworks.isEmpty)
              const Text(
                'Quizzes you set up on a deck will land here.',
                style: TextStyle(color: InkColors.muted),
              )
            else
              ..._homeworks.take(6).map(
                    (homework) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(homework.displayTitle),
                      subtitle: Text(
                        _courses
                            .where((course) => course.id == homework.courseId)
                            .map((course) => course.title)
                            .firstOrNull ??
                            'Deck',
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => _startHomework(homework),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
