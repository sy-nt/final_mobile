import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';

Future<Homework?> showQuizSetupSheet(
  BuildContext context,
  String courseId,
  int cardCount,
) {
  return showModalBottomSheet<Homework>(
    context: context,
    isScrollControlled: true,
    builder: (context) => QuizSetupSheet(courseId: courseId, cardCount: cardCount),
  );
}

class QuizSetupSheet extends StatefulWidget {
  const QuizSetupSheet({
    super.key,
    required this.courseId,
    required this.cardCount,
  });

  final String courseId;
  final int cardCount;

  @override
  State<QuizSetupSheet> createState() => _QuizSetupSheetState();
}

class _QuizSetupSheetState extends State<QuizSetupSheet> {
  String _type = 'MULTIPLE_CHOICE';
  String _direction = 'MIXED';
  late int _count;
  final _title = TextEditingController();
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _count = widget.cardCount.clamp(1, widget.cardCount);
  }

  @override
  void dispose() {
    _title.dispose();
    super.dispose();
  }

  Future<void> _start() async {
    setState(() => _busy = true);
    try {
      final homework = await context.read<AppRepositories>().homeworks.create(
            courseId: widget.courseId,
            type: _type,
            direction: _direction,
            questionCount: _count,
            title: _title.text.trim(),
          );
      if (mounted) Navigator.pop(context, homework);
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 16, 20, 20 + MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Set a quiz', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              ChoiceChip(
                label: const Text('Multiple choice'),
                selected: _type == 'MULTIPLE_CHOICE',
                onSelected: (_) => setState(() => _type = 'MULTIPLE_CHOICE'),
              ),
              ChoiceChip(
                label: const Text('Write the word'),
                selected: _type == 'WRITE_WORD',
                onSelected: (_) => setState(() => _type = 'WRITE_WORD'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              for (final item in const [
                ('MIXED', 'Mixed'),
                ('EN_TO_VI', 'EN → VI'),
                ('VI_TO_EN', 'VI → EN'),
              ])
                ChoiceChip(
                  label: Text(item.$2),
                  selected: _direction == item.$1,
                  onSelected: (_) => setState(() => _direction = item.$1),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text('Questions: $_count'),
          if (widget.cardCount > 1)
            Slider(
              min: 1,
              max: widget.cardCount.toDouble(),
              divisions: widget.cardCount - 1,
              value: _count.toDouble(),
              onChanged: (value) => setState(() => _count = value.round()),
            ),
          TextField(
            controller: _title,
            decoration: const InputDecoration(labelText: 'Title (optional)'),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _busy ? null : _start,
              child: Text(_busy ? 'Preparing…' : 'Start'),
            ),
          ),
        ],
      ),
    );
  }
}
