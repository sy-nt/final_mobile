import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';
import '../shell/main_shell.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  List<Folder> _folders = [];
  List<Course> _courses = [];
  String? _folderId;
  String? _lastId;
  bool _hasNext = false;
  bool _loading = true;
  Object? _error;
  int? _tabIndex;

  AppRepositories get _repos => context.read<AppRepositories>();

  @override
  void initState() {
    super.initState();
    _reload();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final index = ShellTabIndex.of(context);
    final returned = _tabIndex != null && _tabIndex != 1 && index == 1;
    _tabIndex = index;
    if (returned) _reload();
  }

  Future<void> _reload() async {
    setState(() {
      _loading = true;
      _error = null;
      _courses = [];
      _lastId = null;
    });
    try {
      final folders = await _repos.folders.list();
      final page = await _repos.courses.list(folderId: _folderId);
      if (!mounted) return;
      setState(() {
        _folders = folders;
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
    if (!_hasNext) return;
    final page = await _repos.courses.list(lastId: _lastId, folderId: _folderId);
    if (!mounted) return;
    setState(() {
      _courses = [..._courses, ...page.items];
      _lastId = page.lastId;
      _hasNext = page.hasNextPage;
    });
  }

  Future<void> _createFolder() async {
    final name = await promptText(context, title: 'New folder', hint: 'Week 3 verbs');
    if (name == null || name.isEmpty) return;
    try {
      await _repos.folders.create(name);
      await _reload();
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _folderActions(Folder folder) async {
    final action = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Rename'),
              onTap: () => Navigator.pop(context, 'rename'),
            ),
            ListTile(
              title: const Text('Delete'),
              onTap: () => Navigator.pop(context, 'delete'),
            ),
          ],
        ),
      ),
    );
    if (!mounted || action == null) return;
    try {
      if (action == 'rename') {
        final name = await promptText(context, title: 'Rename folder', initial: folder.name);
        if (name == null || name.isEmpty) return;
        await _repos.folders.rename(folder.id, name);
      } else {
        final ok = await confirmDanger(
          context,
          title: 'Delete this folder?',
          body: 'Decks inside stay on your shelf; only the folder goes.',
        );
        if (!ok) return;
        await _repos.folders.delete(folder.id);
        if (_folderId == folder.id) _folderId = null;
      }
      await _reload();
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Library')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await context.push('/courses/new');
          await _reload();
        },
        icon: const Icon(Icons.add),
        label: const Text('New deck'),
      ),
      body: _loading
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
                    child: ListView(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                      children: [
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            ChoiceChip(
                              label: const Text('All desks'),
                              selected: _folderId == null,
                              onSelected: (_) {
                                _folderId = null;
                                _reload();
                              },
                            ),
                            ..._folders.map(
                              (folder) => GestureDetector(
                                onLongPress: () => _folderActions(folder),
                                child: ChoiceChip(
                                  label: Text(folder.name),
                                  selected: _folderId == folder.id,
                                  onSelected: (_) {
                                    _folderId = folder.id;
                                    _reload();
                                  },
                                ),
                              ),
                            ),
                            ActionChip(
                              label: const Text('+ Folder'),
                              onPressed: _createFolder,
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (_courses.isEmpty)
                          const EmptyView(
                            title: 'The shelf is empty',
                            subtitle: 'Make a deck, then fill it with English–Vietnamese pairs.',
                          )
                        else
                          ..._courses.map(
                            (course) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: PaperCard(
                                onTap: () async {
                                  await context.push('/courses/${course.id}');
                                  await _reload();
                                },
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      course.title,
                                      style: Theme.of(context).textTheme.titleLarge,
                                    ),
                                    if (course.description != null &&
                                        course.description!.isNotEmpty) ...[
                                      const SizedBox(height: 6),
                                      Text(
                                        course.description!,
                                        style: const TextStyle(color: InkColors.muted),
                                      ),
                                    ],
                                    const SizedBox(height: 8),
                                    Text(
                                      '${course.cloneCount} copies in the wild',
                                      style: const TextStyle(
                                        color: InkColors.muted,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
    );
  }
}
