import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/session.dart';
import '../../core/theme.dart';
import '../../core/widgets.dart';
import '../../data/repositories.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _email.text = context.read<SessionController>().user?.email ?? '';
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _busy = true);
    try {
      final repos = context.read<AppRepositories>();
      final session = context.read<SessionController>();
      final updated = await repos.auth.updateMe(
        email: _email.text.trim(),
        password: _password.text.trim().isEmpty ? null : _password.text.trim(),
      );
      await session.updateUser(updated);
      _password.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Account updated')),
        );
      }
    } catch (error) {
      if (mounted) showError(context, error);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete this desk?'),
        content: const Text('Your decks, quizzes, and stats go with it.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Keep')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    final repos = context.read<AppRepositories>();
    final session = context.read<SessionController>();
    try {
      await repos.auth.deleteAccount();
      await session.logout();
      if (mounted) context.go('/login');
    } catch (error) {
      if (mounted) showError(context, error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionController>();
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          PaperCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Signed in', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 6),
                Text(session.user?.displayName ?? '', style: const TextStyle(color: InkColors.muted)),
                if (session.user?.email != null) ...[
                  const SizedBox(height: 4),
                  Text(session.user!.email, style: const TextStyle(color: InkColors.muted)),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: _email,
            decoration: const InputDecoration(labelText: 'Email'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _password,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'New password (optional)'),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _busy ? null : _save,
            child: Text(_busy ? 'Saving…' : 'Save changes'),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () async {
              await session.logout();
              if (context.mounted) context.go('/login');
            },
            child: const Text('Log out'),
          ),
          TextButton(
            onPressed: _delete,
            child: const Text('Delete account', style: TextStyle(color: InkColors.danger)),
          ),
        ],
      ),
    );
  }
}
