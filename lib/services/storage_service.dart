import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/substance.dart';
import '../models/expense_log.dart';

class StorageService {
  static const String _keyPin = 'vault_pin';
  static const String _keySecurityEnabled = 'vault_security_enabled';
  static const String _keyMonthlyIncome = 'vault_monthly_income';
  static const String _keyCurrency = 'vault_currency';
  static const String _keyIsFirstTime = 'vault_is_first_time';
  static const String _keySubstances = 'vault_substances';
  static const String _keyExpenses = 'vault_expenses';
  static const String _keyThemeMode = 'vault_theme_mode';

  static SharedPreferences? _prefs;

  // In-memory fallback map in case SharedPreferences is temporarily unavailable
  static final Map<String, dynamic> _fallbackMemory = {};

  static Future<void> init() async {
    try {
      _prefs = await SharedPreferences.getInstance();
    } catch (e) {
      debugPrint('SharedPreferences init error: $e');
    }
  }

  static Future<SharedPreferences?> _ensurePrefs() async {
    if (_prefs != null) return _prefs;
    try {
      _prefs = await SharedPreferences.getInstance();
    } catch (_) {}
    return _prefs;
  }

  // Security PIN
  static String getPin() {
    if (_prefs != null) {
      return _prefs!.getString(_keyPin) ?? '';
    }
    return (_fallbackMemory[_keyPin] as String?) ?? '';
  }

  static Future<void> setPin(String pin) async {
    _fallbackMemory[_keyPin] = pin;
    _fallbackMemory[_keySecurityEnabled] = pin.isNotEmpty;
    final prefs = await _ensurePrefs();
    if (prefs != null) {
      await prefs.setString(_keyPin, pin);
      await prefs.setBool(_keySecurityEnabled, pin.isNotEmpty);
    }
  }

  static bool isSecurityEnabled() {
    if (_prefs != null) {
      return _prefs!.getBool(_keySecurityEnabled) ?? (_prefs!.getString(_keyPin)?.isNotEmpty ?? false);
    }
    return (_fallbackMemory[_keySecurityEnabled] as bool?) ??
        ((_fallbackMemory[_keyPin] as String?)?.isNotEmpty ?? false);
  }

  static Future<void> setSecurityEnabled(bool enabled) async {
    _fallbackMemory[_keySecurityEnabled] = enabled;
    final prefs = await _ensurePrefs();
    if (prefs != null) {
      await prefs.setBool(_keySecurityEnabled, enabled);
    }
  }

  // Monthly Income
  static double? getMonthlyIncome() {
    if (_prefs != null) {
      final val = _prefs!.getDouble(_keyMonthlyIncome);
      if (val != null) return val;
      final str = _prefs!.getString(_keyMonthlyIncome);
      if (str != null) return double.tryParse(str);
      return null;
    }
    return _fallbackMemory[_keyMonthlyIncome] as double?;
  }

  static Future<void> setMonthlyIncome(double? income) async {
    _fallbackMemory[_keyMonthlyIncome] = income;
    final prefs = await _ensurePrefs();
    if (prefs != null) {
      if (income == null) {
        await prefs.remove(_keyMonthlyIncome);
      } else {
        await prefs.setDouble(_keyMonthlyIncome, income);
      }
    }
  }

  // Currency
  static String getCurrency() {
    if (_prefs != null) {
      return _prefs!.getString(_keyCurrency) ?? '\$';
    }
    return (_fallbackMemory[_keyCurrency] as String?) ?? '\$';
  }

  static Future<void> setCurrency(String currency) async {
    _fallbackMemory[_keyCurrency] = currency;
    final prefs = await _ensurePrefs();
    if (prefs != null) {
      await prefs.setString(_keyCurrency, currency);
    }
  }

  // First time launch
  static bool isFirstTimeLaunch() {
    if (_prefs != null) {
      return _prefs!.getBool(_keyIsFirstTime) ?? true;
    }
    return (_fallbackMemory[_keyIsFirstTime] as bool?) ?? true;
  }

  static Future<void> setFirstTimeLaunch(bool isFirstTime) async {
    _fallbackMemory[_keyIsFirstTime] = isFirstTime;
    final prefs = await _ensurePrefs();
    if (prefs != null) {
      await prefs.setBool(_keyIsFirstTime, isFirstTime);
    }
  }

  // Theme Mode
  static String getThemeMode() {
    if (_prefs != null) {
      return _prefs!.getString(_keyThemeMode) ?? 'dark';
    }
    return (_fallbackMemory[_keyThemeMode] as String?) ?? 'dark';
  }

  static Future<void> setThemeMode(String mode) async {
    _fallbackMemory[_keyThemeMode] = mode;
    final prefs = await _ensurePrefs();
    if (prefs != null) {
      await prefs.setString(_keyThemeMode, mode);
    }
  }

  // Substances list
  static List<Substance> getSubstances() {
    String? rawJson;
    if (_prefs != null) {
      rawJson = _prefs!.getString(_keySubstances);
    } else {
      rawJson = _fallbackMemory[_keySubstances] as String?;
    }

    if (rawJson != null && rawJson.isNotEmpty) {
      try {
        final decoded = jsonDecode(rawJson) as List<dynamic>;
        return decoded
            .map((item) => Substance.fromMap(item as Map<String, dynamic>))
            .toList();
      } catch (e) {
        debugPrint('Error parsing stored substances: $e');
      }
    }

    // Default starting substance: Cigarettes, 0 days sober streak
    return [
      Substance(
        id: 1,
        name: 'Cigarettes',
        unitName: 'pack',
        costPerDay: 12.50,
        costPerUnit: 12.50,
        quitDate: DateTime.now(),
        iconName: 'smoke',
        colorHex: '#EF4444',
        isActive: true,
      ),
    ];
  }

  static Future<void> saveSubstances(List<Substance> substances) async {
    final rawJson = jsonEncode(substances.map((s) => s.toMap()).toList());
    _fallbackMemory[_keySubstances] = rawJson;
    final prefs = await _ensurePrefs();
    if (prefs != null) {
      await prefs.setString(_keySubstances, rawJson);
    }
  }

  // Expense logs
  static List<ExpenseLog> getExpenses() {
    String? rawJson;
    if (_prefs != null) {
      rawJson = _prefs!.getString(_keyExpenses);
    } else {
      rawJson = _fallbackMemory[_keyExpenses] as String?;
    }

    if (rawJson != null && rawJson.isNotEmpty) {
      try {
        final decoded = jsonDecode(rawJson) as List<dynamic>;
        return decoded
            .map((item) => ExpenseLog.fromMap(item as Map<String, dynamic>))
            .toList();
      } catch (e) {
        debugPrint('Error parsing stored expenses: $e');
      }
    }

    return [];
  }

  static Future<void> saveExpenses(List<ExpenseLog> expenses) async {
    final rawJson = jsonEncode(expenses.map((e) => e.toMap()).toList());
    _fallbackMemory[_keyExpenses] = rawJson;
    final prefs = await _ensurePrefs();
    if (prefs != null) {
      await prefs.setString(_keyExpenses, rawJson);
    }
  }
}
