import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'core/api_client.dart';
import 'core/config.dart';
import 'core/router.dart';
import 'core/session.dart';
import 'core/theme.dart';
import 'data/repositories.dart';

class InkDeckApp extends StatefulWidget {
  const InkDeckApp({super.key, this.session, this.api});

  final SessionController? session;
  final ApiClient? api;

  @override
  State<InkDeckApp> createState() => _InkDeckAppState();
}

class _InkDeckAppState extends State<InkDeckApp> {
  late final SessionController _session;
  late final ApiClient _api;
  late final AppRepositories _repos;
  late final GoRouter router;
  bool _booting = true;

  @override
  void initState() {
    super.initState();
    _session = widget.session ?? SessionController();
    _api = widget.api ?? ApiClient(baseUrl: AppConfig.apiBaseUrl);
    _session.bindApi(_api);
    _repos = AppRepositories(_api);
    router = createRouter(_session);
    _boot();
  }

  Future<void> _boot() async {
    await _session.restore();
    if (_session.isLoggedIn && _session.user == null) {
      try {
        final me = await _repos.auth.getMe();
        await _session.updateUser(me);
      } catch (_) {
        await _session.logout();
      }
    }
    if (mounted) setState(() => _booting = false);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _session),
        Provider.value(value: _repos),
      ],
      child: MaterialApp.router(
        title: 'InkDeck',
        theme: InkTheme.light,
        routerConfig: router,
        builder: (context, child) {
          if (_booting) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          return child ?? const SizedBox.shrink();
        },
      ),
    );
  }
}
