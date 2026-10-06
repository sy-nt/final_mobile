import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../library/review_screen.dart';
import 'report_sheet.dart';

class PublicCourseScreen extends StatefulWidget {
  const PublicCourseScreen({super.key, required this.courseId});

  final String courseId;

  @override
  State<PublicCourseScreen> createState() => _PublicCourseScreenState();
}

class _PublicCourseScreenState extends State<PublicCourseScreen> {
  Course? _course;
  List<Flashcard> _cards = [];
  bool _loading = true;
  bool _cloning = false;
  String? _copiedId;
  Object? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final repos = context.read<AppRepositories>();
      final course = await repos.courses.getById(widget.courseId);
      final cards = await repos.flashcards.list(widget.courseId);
      if (!mounted) return;
      setState(() {
        _course = course;
        _cards = cards;
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

  Future<void> _clone() async {
    setState(() => _cloning = true);
    try {
      final repos = context.read<AppRepositories>();
      final cloned = await repos.courses.cloneCourse(widget.courseId);
      if (!mounted) return;
      setState(() => _copiedId = cloned.id);
      showCopiedDesk(
        context,
        title: cloned.title,
        onOpen: () => context.push('/courses/${cloned.id}'),
        onReview: () async {
          final cards = await repos.flashcards.list(cloned.id);
          if (!mounted || cards.isEmpty) return;
          await Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => ReviewScreen(cards: cards)),
          );
        },
      );
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _cloning = false);
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
        leading: const DeskBackButton(fallback: '/discover'),
        title: Text(course.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.flag_outlined),
            onPressed: () => showReportSheet(context, course.id),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          if (course.description != null) Text(course.description!, style: const TextStyle(color: InkColors.muted)),
          const SizedBox(height: 12),
          Text('${course.cloneCount} copies', style: const TextStyle(color: InkColors.muted)),
          const SizedBox(height: 16),
          if (course.isOwner)
            const Text('This one is already yours.')
          else if (_copiedId != null)
            FilledButton(
              onPressed: () => context.push('/courses/$_copiedId'),
              child: const Text('Open my copy'),
            )
          else
            FilledButton(
              onPressed: _cloning ? null : _clone,
              child: Text(_cloning ? 'Copying…' : 'Copy onto my desk'),
            ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: _cards.isEmpty
                ? null
                : () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => ReviewScreen(cards: _cards)),
                    ),
            child: const Text('Preview cards'),
          ),
          const SizedBox(height: 20),
          ..._cards.map(
            (card) => ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(card.wordEn),
              subtitle: Text(card.wordVi),
            ),
          ),
        ],
      ),
    );
  }
}
