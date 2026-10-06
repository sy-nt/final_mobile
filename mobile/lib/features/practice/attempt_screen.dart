import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import 'result_screen.dart';

class AttemptScreen extends StatefulWidget {
  const AttemptScreen({
    super.key,
    required this.homeworkId,
    required this.courseId,
    required this.started,
  });

  final String homeworkId;
  final String courseId;
  final StartAttempt started;

  @override
  State<AttemptScreen> createState() => _AttemptScreenState();
}

class _AttemptScreenState extends State<AttemptScreen> {
  int _index = 0;
  AttemptAnswer? _feedback;
  String? _chosen;
  bool _busy = false;
  final _written = TextEditingController();
  final _answers = <AttemptAnswer>[];

  List<QuizQuestion> get _questions => widget.started.questions;
  QuizQuestion get _current => _questions[_index];

  @override
  void dispose() {
    _written.dispose();
    super.dispose();
  }

  Color? _optionFill(String option) {
    if (_feedback == null) return null;
    if (option == _feedback!.expectedAnswer) {
      return InkColors.success.withValues(alpha: 0.18);
    }
    if (option == _chosen && !_feedback!.isCorrect) {
      return InkColors.danger.withValues(alpha: 0.16);
    }
    return null;
  }

  Color _optionSide(String option) {
    if (_feedback == null) return InkColors.line;
    if (option == _feedback!.expectedAnswer) return InkColors.success;
    if (option == _chosen && !_feedback!.isCorrect) return InkColors.danger;
    return InkColors.line;
  }

  Future<void> _submit(String answer) async {
    if (_busy || _feedback != null || answer.trim().isEmpty) return;
    setState(() => _busy = true);
    try {
      final result = await context.read<AppRepositories>().homeworks.submit(
            homeworkId: widget.homeworkId,
            attemptId: widget.started.attemptId,
            flashcardId: _current.flashcardId,
            direction: _current.direction,
            userAnswer: answer,
          );
      if (!mounted) return;
      setState(() {
        _feedback = result;
        _chosen = answer;
        _answers.add(result);
      });
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _next() async {
    if (_index < _questions.length - 1) {
      setState(() {
        _index += 1;
        _feedback = null;
        _chosen = null;
        _written.clear();
      });
      return;
    }
    try {
      final summary = await context.read<AppRepositories>().homeworks.complete(
            widget.homeworkId,
            widget.started.attemptId,
          );
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => ResultScreen(
            homeworkId: widget.homeworkId,
            courseId: widget.courseId,
            attemptId: widget.started.attemptId,
            summary: summary,
            questions: _questions,
            answers: List.of(_answers),
          ),
        ),
      );
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final options = _current.options;
    return Scaffold(
      appBar: AppBar(
        title: Text('Question ${_index + 1} / ${_questions.length}'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          LinearProgressIndicator(
            value: (_index + 1) / _questions.length,
            color: InkColors.saffron,
            backgroundColor: InkColors.line,
          ),
          const SizedBox(height: 28),
          Text(
            _current.direction == 'VI_TO_EN' ? 'VI → EN' : 'EN → VI',
            style: const TextStyle(color: InkColors.muted, letterSpacing: 1.4),
          ),
          const SizedBox(height: 12),
          Headword(_current.prompt, size: 36),
          const SizedBox(height: 28),
          if (options != null && options.isNotEmpty)
            ...options.map(
              (option) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    backgroundColor: _optionFill(option),
                    side: BorderSide(color: _optionSide(option)),
                  ),
                  onPressed: _feedback == null ? () => _submit(option) : null,
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(option),
                  ),
                ),
              ),
            )
          else ...[
            TextField(
              controller: _written,
              enabled: _feedback == null,
              decoration: const InputDecoration(labelText: 'Your answer'),
              onSubmitted: _submit,
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _feedback == null ? () => _submit(_written.text.trim()) : null,
              child: const Text('Check'),
            ),
          ],
          if (_feedback != null) ...[
            const SizedBox(height: 20),
            PaperCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _feedback!.isCorrect ? 'Correct' : 'Not quite',
                    style: TextStyle(
                      color: _feedback!.isCorrect ? InkColors.success : InkColors.danger,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text('Expected: ${_feedback!.expectedAnswer}'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _next,
              child: Text(_index == _questions.length - 1 ? 'See score' : 'Next'),
            ),
          ],
        ],
      ),
    );
  }
}
