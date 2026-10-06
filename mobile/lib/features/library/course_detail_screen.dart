import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../practice/attempt_screen.dart';
import '../practice/quiz_setup_sheet.dart';
import 'flashcard_form_screen.dart';
import 'review_screen.dart';
import 'share_sheet.dart';

class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({super.key, required this.courseId});

  final String courseId;

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  Course? _course;
  List<Flashcard> _cards = [];
  List<Tag> _tags = [];
  List<Homework> _homeworks = [];
  List<Folder> _folders = [];
  bool _loading = true;
  bool _public = false;
  bool _togglingPublic = false;
  Object? _error;

  AppRepositories get _repos => context.read<AppRepositories>();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final course = await _repos.courses.getById(widget.courseId);
      final cards = await _repos.flashcards.list(widget.courseId);
      List<Tag> tags = [];
      List<Homework> homeworks = [];
      List<Folder> folders = [];
      var isPublic = false;
      if (course.isOwner) {
        tags = await _repos.tags.courseTags(widget.courseId);
        homeworks = await _repos.homeworks.list(courseId: widget.courseId);
        folders = await _repos.folders.list();
        final shares = await _repos.shares.list(widget.courseId);
        isPublic = shares.any((share) => share.shareType == 'ALL' && share.status == 'ACTIVE');
      }
      if (!mounted) return;
      setState(() {
        _course = course;
        _cards = cards;
        _tags = tags;
        _homeworks = homeworks;
        _folders = folders;
        _public = isPublic;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error;
        _loading = false;
      });
    }
  }

  Future<void> _addTag() async {
    final name = await promptText(context, title: 'Add tag', hint: 'travel');
    if (name == null || name.isEmpty) return;
    try {
      final tag = await _repos.tags.attach(widget.courseId, name);
      setState(() => _tags = [..._tags.where((item) => item.id != tag.id), tag]);
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _quiz() async {
    final homework = await showQuizSetupSheet(context, widget.courseId, _cards.length);
    if (homework == null || !mounted) return;
    try {
      final started = await _repos.homeworks.start(homework.id);
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => AttemptScreen(
            homeworkId: homework.id,
            courseId: widget.courseId,
            started: started,
          ),
        ),
      );
      await _load();
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _addToFolder() async {
    if (_folders.isEmpty) {
      showError(context, 'Make a folder in Library first');
      return;
    }
    final id = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: _folders
              .map(
                (folder) => ListTile(
                  title: Text(folder.name),
                  onTap: () => Navigator.pop(context, folder.id),
                ),
              )
              .toList(),
        ),
      ),
    );
    if (id == null) return;
    try {
      await _repos.folders.addCourse(id, widget.courseId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Filed on the shelf')),
        );
      }
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _togglePublic(bool value) async {
    setState(() => _togglingPublic = true);
    try {
      if (value) {
        await _repos.shares.create(widget.courseId, shareType: 'ALL');
      } else {
        final shares = await _repos.shares.list(widget.courseId);
        final share = shares.where((item) => item.shareType == 'ALL' && item.status == 'ACTIVE');
        if (share.isNotEmpty) {
          await _repos.shares.revoke(widget.courseId, share.first.id);
        }
      }
      if (mounted) setState(() => _public = value);
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _togglingPublic = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_error != null) {
      return Scaffold(body: ErrorView(message: _error.toString(), onRetry: _load));
    }
    final course = _course!;
    return Scaffold(
      appBar: AppBar(
        leading: const DeskBackButton(),
        title: Text(course.title),
        actions: [
          if (course.isOwner)
            PopupMenuButton<String>(
              onSelected: (value) async {
                if (value == 'edit') {
                  await context.push('/courses/${course.id}/edit', extra: course);
                  await _load();
                } else if (value == 'share') {
                  await showShareSheet(context, course.id);
                } else if (value == 'folder') {
                  await _addToFolder();
                } else if (value == 'delete') {
                  final ok = await confirmDanger(
                    context,
                    title: 'Delete this deck?',
                    body: 'Cards, quizzes, and copies of this copy go with it.',
                  );
                  if (!ok || !context.mounted) return;
                  await _repos.courses.delete(course.id);
                  if (context.mounted) context.go('/library');
                }
              },
              itemBuilder: (context) => const [
                PopupMenuItem(value: 'edit', child: Text('Edit')),
                PopupMenuItem(value: 'share', child: Text('Share')),
                PopupMenuItem(value: 'folder', child: Text('Add to folder')),
                PopupMenuItem(value: 'delete', child: Text('Delete')),
              ],
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          if (course.description != null && course.description!.isNotEmpty)
            Text(course.description!, style: const TextStyle(color: InkColors.muted)),
          const SizedBox(height: 12),
          if (course.isOwner) ...[
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Show in Discover'),
              subtitle: const Text('Anyone can browse and copy this deck'),
              value: _public,
              onChanged: _togglingPublic ? null : _togglePublic,
            ),
            const SizedBox(height: 8),
          ],
          if (course.isOwner) ...[
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ..._tags.map(
                  (tag) => InputChip(
                    label: Text(tag.name),
                    onDeleted: () async {
                      await _repos.tags.detach(course.id, tag.id);
                      setState(() => _tags.removeWhere((item) => item.id == tag.id));
                    },
                  ),
                ),
                ActionChip(label: const Text('+ Tag'), onPressed: _addTag),
              ],
            ),
            const SizedBox(height: 16),
          ],
          Row(
            children: [
              Expanded(
                child: FilledButton(
                  onPressed: _cards.isEmpty
                      ? null
                      : () => Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => ReviewScreen(cards: _cards),
                            ),
                          ),
                  child: const Text('Review'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: !course.isOwner || _cards.isEmpty ? null : _quiz,
                  child: const Text('Quiz'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Text('Cards', style: Theme.of(context).textTheme.titleLarge),
              const Spacer(),
              if (course.isOwner)
                TextButton(
                  onPressed: () async {
                    await Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => FlashcardFormScreen(courseId: course.id),
                      ),
                    );
                    await _load();
                  },
                  child: const Text('Add card'),
                ),
            ],
          ),
          if (_cards.isEmpty)
            const EmptyView(
              title: 'No cards yet',
              subtitle: 'Add an English word and its Vietnamese face.',
            )
          else
            ..._cards.map(
              (card) => ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(card.wordEn),
                subtitle: Text(card.wordVi),
                onTap: !course.isOwner
                    ? null
                    : () async {
                        await Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => FlashcardFormScreen(
                              courseId: course.id,
                              card: card,
                            ),
                          ),
                        );
                        await _load();
                      },
                trailing: course.isOwner
                    ? IconButton(
                        icon: const Icon(Icons.delete_outline),
                        onPressed: () async {
                          final ok = await confirmDanger(
                            context,
                            title: 'Delete this card?',
                            body: '“${card.wordEn}” will leave the deck.',
                          );
                          if (!ok) return;
                          await _repos.flashcards.delete(course.id, card.id);
                          await _load();
                        },
                      )
                    : null,
              ),
            ),
          if (course.isOwner && _homeworks.isNotEmpty) ...[
            const SizedBox(height: 20),
            Text('Saved quizzes', style: Theme.of(context).textTheme.titleLarge),
            ..._homeworks.map(
              (homework) => ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(homework.displayTitle),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline),
                  onPressed: () async {
                    final ok = await confirmDanger(
                      context,
                      title: 'Delete this quiz?',
                      body: 'Saved questions for “${homework.displayTitle}” will be removed.',
                    );
                    if (!ok) return;
                    await _repos.homeworks.delete(homework.id);
                    await _load();
                  },
                ),
                onTap: () async {
                  try {
                    final started = await _repos.homeworks.start(homework.id);
                    if (!context.mounted) return;
                    await Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AttemptScreen(
                          homeworkId: homework.id,
                          courseId: widget.courseId,
                          started: started,
                        ),
                      ),
                    );
                    await _load();
                  } catch (error) {
                    if (context.mounted) showError(context, error);
                  }
                },
              ),
            ),
          ],
        ],
      ),
    );
  }
}
