import 'package:go_router/go_router.dart';

import '../data/models.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/discover/gallery_screen.dart';
import '../features/discover/public_course_screen.dart';
import '../features/home/home_screen.dart';
import '../features/library/course_detail_screen.dart';
import '../features/library/course_form_screen.dart';
import '../features/library/library_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/shell/main_shell.dart';
import 'session.dart';

GoRouter createRouter(SessionController session) {
  return GoRouter(
    initialLocation: '/home',
    refreshListenable: session,
    redirect: (context, state) {
      if (!session.ready) return null;
      final loggingIn = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';
      if (!session.isLoggedIn && !loggingIn) return '/login';
      if (session.isLoggedIn && loggingIn) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/library',
                builder: (context, state) => const LibraryScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/discover',
                builder: (context, state) => const GalleryScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/courses/new',
        builder: (context, state) => const CourseFormScreen(),
      ),
      GoRoute(
        path: '/courses/:courseId/edit',
        builder: (context, state) => CourseFormScreen(
          courseId: state.pathParameters['courseId'],
          course: state.extra as Course?,
        ),
      ),
      GoRoute(
        path: '/courses/:courseId',
        builder: (context, state) => CourseDetailScreen(
          courseId: state.pathParameters['courseId']!,
        ),
      ),
      GoRoute(
        path: '/gallery/:courseId',
        builder: (context, state) => PublicCourseScreen(
          courseId: state.pathParameters['courseId']!,
        ),
      ),
    ],
  );
}
