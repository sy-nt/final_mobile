import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';

class FlashcardFormScreen extends StatefulWidget {
  const FlashcardFormScreen({
    super.key,
    required this.courseId,
    this.card,
  });

  final String courseId;
  final Flashcard? card;

  @override
  State<FlashcardFormScreen> createState() => _FlashcardFormScreenState();
}

class _FlashcardFormScreenState extends State<FlashcardFormScreen> {
  late final TextEditingController _en;
  late final TextEditingController _vi;
  late final TextEditingController _example;
  Timer? _debounce;
  bool _busy = false;
  bool _suggesting = false;

  @override
  void initState() {
    super.initState();
    _en = TextEditingController(text: widget.card?.wordEn);
    _vi = TextEditingController(text: widget.card?.wordVi);
    _example = TextEditingController(text: widget.card?.example);
    _en.addListener(() => _queueSuggest('en', _en.text));
    _vi.addListener(() => _queueSuggest('vi', _vi.text));
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _en.dispose();
    _vi.dispose();
    _example.dispose();
    super.dispose();
  }

  void _queueSuggest(String from, String text) {
    _debounce?.cancel();
    if (text.trim().length < 2) return;
    _debounce = Timer(const Duration(milliseconds: 450), () => _suggest(from, text));
  }

  Future<void> _suggest(String from, String text) async {
    final targetEmpty = from == 'en' ? _vi.text.trim().isEmpty : _en.text.trim().isEmpty;
    if (!targetEmpty) return;
    setState(() => _suggesting = true);
    try {
      final translation = await context.read<AppRepositories>().flashcards.suggest(
            from: from,
            text: text.trim(),
          );
      if (!mounted || translation == null) return;
      if (from == 'en' && _vi.text.trim().isEmpty) _vi.text = translation;
      if (from == 'vi' && _en.text.trim().isEmpty) _en.text = translation;
    } catch (_) {
      // Suggestion is optional.
    } finally {
      if (mounted) setState(() => _suggesting = false);
    }
  }

  Future<void> _save() async {
    if (_en.text.trim().isEmpty || _vi.text.trim().isEmpty) return;
    setState(() => _busy = true);
    try {
      final repos = context.read<AppRepositories>();
      if (widget.card == null) {
        await repos.flashcards.create(
          widget.courseId,
          wordEn: _en.text.trim(),
          wordVi: _vi.text.trim(),
          example: _example.text.trim(),
        );
      } else {
        await repos.flashcards.update(
          widget.courseId,
          widget.card!.id,
          wordEn: _en.text.trim(),
          wordVi: _vi.text.trim(),
          example: _example.text.trim(),
        );
      }
      if (mounted) context.pop(true);
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.card == null ? 'New card' : 'Edit card')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: _en,
            decoration: const InputDecoration(labelText: 'English'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _vi,
            decoration: InputDecoration(
              labelText: 'Vietnamese',
              suffix: _suggesting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : null,
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _example,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Example (optional)'),
          ),
          const SizedBox(height: 8),
          const Text(
            'Leave one side blank and the desk will try a translation.',
            style: TextStyle(color: InkColors.muted, fontSize: 12),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _busy ? null : _save,
            child: Text(_busy ? 'Saving…' : 'Save card'),
          ),
        ],
      ),
    );
  }
}
