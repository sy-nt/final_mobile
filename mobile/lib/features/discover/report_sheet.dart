import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/widgets.dart';
import '../../data/repositories.dart';

const reportReasons = [
  ('SPAM', 'Spam'),
  ('INAPPROPRIATE_CONTENT', 'Inappropriate'),
  ('COPYRIGHT', 'Copyright'),
  ('OTHER', 'Other'),
];

Future<void> showReportSheet(BuildContext context, String courseId) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (context) => ReportSheet(courseId: courseId),
  );
}

class ReportSheet extends StatefulWidget {
  const ReportSheet({super.key, required this.courseId});

  final String courseId;

  @override
  State<ReportSheet> createState() => _ReportSheetState();
}

class _ReportSheetState extends State<ReportSheet> {
  String _reason = 'SPAM';
  final _detail = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _detail.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _busy = true);
    try {
      await context.read<AppRepositories>().shares.report(
            widget.courseId,
            reason: _reason,
            detail: _detail.text.trim(),
          );
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Report sent')),
      );
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
          Text('Report deck', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            children: [
              for (final item in reportReasons)
                ChoiceChip(
                  label: Text(item.$2),
                  selected: _reason == item.$1,
                  onSelected: (_) => setState(() => _reason = item.$1),
                ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _detail,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Details (optional)'),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _busy ? null : _submit,
              child: Text(_busy ? 'Sending…' : 'Submit report'),
            ),
          ),
        ],
      ),
    );
  }
}
