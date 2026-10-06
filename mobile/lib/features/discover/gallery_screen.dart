import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../shell/main_shell.dart';

class GalleryScreen extends StatefulWidget {
  const GalleryScreen({super.key});

  @override
  State<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends State<GalleryScreen> {
  final _title = TextEditingController();
  List<Course> _courses = [];
  List<Tag> _tags = [];
  String? _selectedTag;
  String? _lastId;
  bool _hasNext = false;
  bool _loading = true;
  Object? _error;
  Timer? _debounce;
  int? _tabIndex;

  @override
  void initState() {
    super.initState();
    _title.addListener(_onSearchChanged);
    _reload();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final index = ShellTabIndex.of(context);
    final returned = _tabIndex != null && _tabIndex != 2 && index == 2;
    _tabIndex = index;
    if (returned) _reload();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _title.removeListener(_onSearchChanged);
    _title.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), _reload);
  }

  Future<void> _reload() async {
    setState(() {
      _loading = true;
      _error = null;
      _courses = [];
      _lastId = null;
    });
    try {
      final repos = context.read<AppRepositories>();
      final tags = await repos.tags.search(null);
      final page = await repos.courses.gallery(
            title: _title.text.trim(),
            tag: _selectedTag,
          );
      if (!mounted) return;
      setState(() {
        _tags = tags;
        _courses = page.items;
        _lastId = page.lastId;
        _hasNext = page.hasNextPage;
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

  Future<void> _more() async {
    if (!_hasNext || _loading) return;
    final page = await context.read<AppRepositories>().courses.gallery(
          lastId: _lastId,
          title: _title.text.trim(),
          tag: _selectedTag,
        );
    if (!mounted) return;
    setState(() {
      _courses = [..._courses, ...page.items];
      _lastId = page.lastId;
      _hasNext = page.hasNextPage;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Discover')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: Column(
              children: [
                TextField(
                  controller: _title,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search),
                    hintText: 'Search titles',
                  ),
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      ChoiceChip(
                        label: const Text('All'),
                        selected: _selectedTag == null,
                        onSelected: (_) {
                          _selectedTag = null;
                          _reload();
                        },
                      ),
                      ..._tags.map(
                        (tag) => ChoiceChip(
                          label: Text(tag.name),
                          selected: _selectedTag == tag.name,
                          onSelected: (_) {
                            _selectedTag = tag.name;
                            _reload();
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? ErrorView(message: _error.toString(), onRetry: _reload)
                    : RefreshIndicator(
                        onRefresh: _reload,
                        child: NotificationListener<ScrollNotification>(
                          onNotification: (notification) {
                            if (notification.metrics.pixels >
                                notification.metrics.maxScrollExtent - 80) {
                              _more();
                            }
                            return false;
                          },
                          child: _courses.isEmpty
                              ? const EmptyView(
                                  title: 'The gallery is quiet',
                                  subtitle: 'Share one of your decks to the public shelf.',
                                )
                              : ListView.builder(
                                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                                  itemCount: _courses.length,
                                  itemBuilder: (context, index) {
                                    final course = _courses[index];
                                    final subtitle = [
                                      if (course.description != null &&
                                          course.description!.isNotEmpty)
                                        course.description!,
                                      if (course.tags.isNotEmpty) course.tags.join(' · '),
                                      '${course.cloneCount} copies${course.isOwner ? ' · yours' : ''}',
                                    ].join('\n');
                                    return Padding(
                                      padding: const EdgeInsets.only(bottom: 12),
                                      child: PaperCard(
                                        onTap: () async {
                                          await context.push('/gallery/${course.id}');
                                          await _reload();
                                        },
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              course.title,
                                              style: Theme.of(context).textTheme.titleLarge,
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              subtitle,
                                              style: const TextStyle(color: InkColors.muted, height: 1.35),
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
