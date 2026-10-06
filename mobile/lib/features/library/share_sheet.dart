import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/models.dart';
import '../../data/repositories.dart';

Future<void> showShareSheet(BuildContext context, String courseId) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (context) => ShareSheet(courseId: courseId),
  );
}

class ShareSheet extends StatefulWidget {
  const ShareSheet({super.key, required this.courseId});

  final String courseId;

  @override
  State<ShareSheet> createState() => _ShareSheetState();
}

class _ShareSheetState extends State<ShareSheet> {
  List<CourseShare> _shares = [];
  final _email = TextEditingController();
  bool _loading = true;

  AppRepositories get _repos => context.read<AppRepositories>();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final shares = await _repos.shares.list(widget.courseId);
      if (!mounted) return;
      setState(() {
        _shares = shares;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _loading = false);
      showError(context, error);
    }
  }

  bool get _public {
    return _shares.any((share) => share.shareType == 'ALL' && share.status == 'ACTIVE');
  }

  Future<void> _togglePublic(bool value) async {
    try {
      if (value) {
        await _repos.shares.create(widget.courseId, shareType: 'ALL');
      } else {
        final share = _shares.firstWhere(
          (item) => item.shareType == 'ALL' && item.status == 'ACTIVE',
        );
        await _repos.shares.revoke(widget.courseId, share.id);
      }
      await _load();
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  Future<void> _invite() async {
    final email = _email.text.trim();
    if (email.isEmpty) return;
    try {
      await _repos.shares.create(widget.courseId, shareType: 'EMAIL', email: email);
      _email.clear();
      await _load();
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 16, 20, 20 + MediaQuery.of(context).viewInsets.bottom),
      child: _loading
          ? const SizedBox(height: 180, child: Center(child: CircularProgressIndicator()))
          : Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Share this deck', style: Theme.of(context).textTheme.titleLarge),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Put it in the gallery'),
                  subtitle: const Text('Anyone on InkDeck can browse and copy it'),
                  value: _public,
                  onChanged: _togglePublic,
                ),
                TextField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Invite by email'),
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: FilledButton(onPressed: _invite, child: const Text('Invite')),
                ),
                const SizedBox(height: 8),
                ..._shares.where((share) => share.status == 'ACTIVE').map(
                      (share) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(
                          share.shareType == 'ALL'
                              ? 'Public gallery'
                              : share.sharedWithEmail ?? 'Email invite',
                        ),
                        subtitle: Text(share.shareType, style: const TextStyle(color: InkColors.muted)),
                        trailing: IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () async {
                            await _repos.shares.revoke(widget.courseId, share.id);
                            await _load();
                          },
                        ),
                      ),
                    ),
              ],
            ),
    );
  }
}
