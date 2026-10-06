import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../library/review_screen.dart';
import 'attempt_screen.dart';

class ResultScreen extends StatefulWidget {
  const ResultScreen({
    super.key,
    required this.homeworkId,
    required this.courseId,
    required this.attemptId,
    required this.summary,
    required this.questions,
    required this.answers,
  });

  final String homeworkId;
  final String courseId;
  final String attemptId;
  final AttemptSummary summary;
  final List<QuizQuestion> questions;
  final List<AttemptAnswer> answers;

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  String _promptFor(AttemptAnswer answer) {
    for (final question in widget.questions) {
      if (question.flashcardId == answer.flashcardId) return question.prompt;
    }
    return 'Prompt';
  }

  Future<void> _retry() async {
    try {
      final started = await context.read<AppRepositories>().homeworks.start(widget.homeworkId);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => AttemptScreen(
            homeworkId: widget.homeworkId,
            courseId: widget.courseId,
            started: started,
          ),
        ),
      );
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _openReview({required bool missedOnly}) async {
    try {
      final cards = await context.read<AppRepositories>().flashcards.list(widget.courseId);
      var selected = cards;
      if (missedOnly) {
        final missed = widget.answers
            .where((answer) => !answer.isCorrect)
            .map((answer) => answer.flashcardId)
            .whereType<String>()
            .toSet();
        selected = cards.where((card) => missed.contains(card.id)).toList();
      }
      if (!mounted || selected.isEmpty) return;
      await Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ReviewScreen(cards: selected)),
      );
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final summary = widget.summary;
    final missed = widget.answers.where((answer) => !answer.isCorrect).length;
    return Scaffold(
      appBar: AppBar(title: const Text('Score')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          PaperCard(
            child: Column(
              children: [
                Headword('${summary.score?.toStringAsFixed(0) ?? '0'}%', size: 56),
                const SizedBox(height: 8),
                Text(
                  '${summary.correctCount} of ${summary.totalQuestions} correct',
                  style: const TextStyle(color: InkColors.muted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          ...widget.answers.map(
            (answer) => ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(
                answer.isCorrect ? Icons.check_circle : Icons.cancel,
                color: answer.isCorrect ? InkColors.success : InkColors.danger,
              ),
              title: Text(_promptFor(answer)),
              subtitle: Text(
                answer.isCorrect
                    ? answer.expectedAnswer
                    : 'You: ${answer.userAnswer} · Expected: ${answer.expectedAnswer}',
              ),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(onPressed: _retry, child: const Text('Retry quiz')),
          const SizedBox(height: 8),
          if (missed > 0)
            OutlinedButton(
              onPressed: () => _openReview(missedOnly: true),
              child: Text('Review missed ($missed)'),
            ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: () => _openReview(missedOnly: false),
            child: const Text('Study the deck'),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Back to the desk'),
          ),
        ],
      ),
    );
  }
}
