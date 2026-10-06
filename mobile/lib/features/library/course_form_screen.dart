import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';

class CourseFormScreen extends StatefulWidget {
  const CourseFormScreen({super.key, this.course, this.courseId});

  final Course? course;
  final String? courseId;

  @override
  State<CourseFormScreen> createState() => _CourseFormScreenState();
}

class _CourseFormScreenState extends State<CourseFormScreen> {
  late final TextEditingController _title;
  late final TextEditingController _description;
  Course? _course;
  bool _busy = false;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _course = widget.course;
    _title = TextEditingController(text: widget.course?.title);
    _description = TextEditingController(text: widget.course?.description);
    if (_course == null && widget.courseId != null) {
      _loading = true;
      _load();
    }
  }

  Future<void> _load() async {
    try {
      final course = await context.read<AppRepositories>().courses.getById(widget.courseId!);
      if (!mounted) return;
      setState(() {
        _course = course;
        _title.text = course.title;
        _description.text = course.description ?? '';
        _loading = false;
      });
    } catch (error) {
      if (mounted) {
        setState(() => _loading = false);
        showError(context, error);
      }
    }
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_title.text.trim().isEmpty) return;
    setState(() => _busy = true);
    try {
      final repos = context.read<AppRepositories>();
      if (_course == null) {
        final created = await repos.courses.create(
          title: _title.text.trim(),
          description: _description.text.trim(),
        );
        if (mounted) context.go('/courses/${created.id}');
      } else {
        await repos.courses.update(
          _course!.id,
          title: _title.text.trim(),
          description: _description.text.trim(),
        );
        if (mounted) context.pop();
      }
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final editing = _course != null;
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return Scaffold(
      appBar: AppBar(
        leading: const DeskBackButton(),
        title: Text(editing ? 'Edit deck' : 'New deck'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: _title,
            decoration: const InputDecoration(labelText: 'Title'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _description,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Description'),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _busy ? null : _save,
            child: Text(_busy ? 'Saving…' : 'Save'),
          ),
        ],
      ),
    );
  }
}
