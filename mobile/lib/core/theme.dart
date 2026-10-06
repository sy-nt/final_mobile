import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class InkColors {
  static const ivory = Color(0xFFF4EBD8);
  static const paper = Color(0xFFFFF8EC);
  static const espresso = Color(0xFF2A1F16);
  static const ink = Color(0xFF1B140F);
  static const saffron = Color(0xFFE0A106);
  static const saffronDeep = Color(0xFFC48404);
  static const muted = Color(0xFF8A7460);
  static const line = Color(0xFFD9C8B0);
  static const success = Color(0xFF3F6B4A);
  static const danger = Color(0xFFB42318);
}

class InkTheme {
  static ThemeData get light {
    final body = GoogleFonts.beVietnamPro();
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: InkColors.ivory,
      fontFamily: body.fontFamily,
      colorScheme: const ColorScheme.light(
        primary: InkColors.espresso,
        onPrimary: InkColors.paper,
        secondary: InkColors.saffron,
        onSecondary: InkColors.ink,
        surface: InkColors.paper,
        onSurface: InkColors.ink,
        error: InkColors.danger,
        onError: Colors.white,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: InkColors.ivory,
        foregroundColor: InkColors.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.fraunces(
          color: InkColors.ink,
          fontSize: 22,
          fontWeight: FontWeight.w600,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: InkColors.paper,
        hintStyle: const TextStyle(color: InkColors.muted),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: InkColors.line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: InkColors.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: InkColors.espresso, width: 1.4),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: InkColors.saffron,
          foregroundColor: InkColors.ink,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: GoogleFonts.beVietnamPro(
            fontWeight: FontWeight.w700,
            fontSize: 16,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: InkColors.espresso,
          side: const BorderSide(color: InkColors.espresso),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: InkColors.espresso,
        foregroundColor: InkColors.paper,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: InkColors.espresso,
        contentTextStyle: GoogleFonts.beVietnamPro(color: InkColors.paper),
        behavior: SnackBarBehavior.floating,
      ),
      dividerColor: InkColors.line,
      chipTheme: ChipThemeData(
        backgroundColor: InkColors.paper,
        selectedColor: InkColors.saffron,
        labelStyle: GoogleFonts.beVietnamPro(color: InkColors.ink),
        side: const BorderSide(color: InkColors.line),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }
}
