import 'package:flutter/material.dart';
import 'models/substance.dart';
import 'models/expense_log.dart';
import 'widgets/substance_card.dart';
import 'widgets/quick_unit_slip_dialog.dart';
import 'widgets/onboarding_tutorial_dialog.dart';
import 'widgets/security_lock_screen.dart';
import 'widgets/initial_security_setup_dialog.dart';
import 'widgets/daily_affirmation_banner.dart';
import 'widgets/crisis_support_bar.dart';
import 'widgets/monthly_income_impact_card.dart';
import 'widgets/urge_sos_dialog.dart';
import 'widgets/add_substance_dialog.dart';
import 'widgets/substance_detail_dialog.dart';
import 'widgets/settings_drawer.dart';

void main() {
  runApp(const HabitVaultApp());
}

class HabitVaultApp extends StatefulWidget {
  const HabitVaultApp({super.key});

  @override
  State<HabitVaultApp> createState() => _HabitVaultAppState();
}

class _HabitVaultAppState extends State<HabitVaultApp> {
  ThemeMode _themeMode = ThemeMode.dark;
  String _pin = '';
  bool _isLocked = false;
  bool _isFirstTimeLaunch = true;
  String _currency = '\$';

  // Default substance: Only Cigarettes, clean streak starts at 0 days
  final List<Substance> _substances = [
    Substance(
      id: 1,
      name: 'Cigarettes',
      unitName: 'pack',
      costPerDay: 12.50,
      costPerUnit: 12.50,
      quitDate: DateTime.now(), // 0 days clean streak
      iconName: 'flame',
      colorHex: '#EF4444',
      isActive: true,
    ),
  ];

  final List<ExpenseLog> _expenses = [];

  void _toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    });
  }

  void _handleUnlock() {
    setState(() {
      _isLocked = false;
    });
  }

  void _handleLockApp() {
    if (_pin.isNotEmpty) {
      setState(() {
        _isLocked = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = _themeMode == ThemeMode.dark;

    return MaterialApp(
      title: 'HabitVault',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF9FAFB),
        primaryColor: const Color(0xFF10B981),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF10B981),
          secondary: Color(0xFF3B82F6),
          surface: Colors.white,
        ),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F1216),
        primaryColor: const Color(0xFF10B981),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFF3B82F6),
          surface: Color(0xFF1E2229),
        ),
        useMaterial3: true,
      ),
      home: _isLocked && _pin.isNotEmpty
          ? SecurityLockScreen(
              correctPin: _pin,
              onUnlock: _handleUnlock,
              isDarkMode: isDark,
            )
          : HomeScreen(
              isDarkMode: isDark,
              onToggleTheme: _toggleTheme,
              currency: _currency,
              onCurrencyChange: (c) => setState(() => _currency = c),
              pin: _pin,
              onPinChange: (newPin) {
                setState(() {
                  _pin = newPin;
                  if (_pin.isNotEmpty) _isLocked = true;
                });
              },
              substances: _substances,
              expenses: _expenses,
              isFirstTimeLaunch: _isFirstTimeLaunch,
              onFirstTimeCompleted: () {
                setState(() => _isFirstTimeLaunch = false);
              },
              onLock: _handleLockApp,
            ),
    );
  }
}

class HomeScreen extends StatefulWidget {
  final bool isDarkMode;
  final VoidCallback onToggleTheme;
  final String currency;
  final Function(String) onCurrencyChange;
  final String pin;
  final Function(String) onPinChange;
  final List<Substance> substances;
  final List<ExpenseLog> expenses;
  final bool isFirstTimeLaunch;
  final VoidCallback onFirstTimeCompleted;
  final VoidCallback onLock;

  const HomeScreen({
    super.key,
    required this.isDarkMode,
    required this.onToggleTheme,
    required this.currency,
    required this.onCurrencyChange,
    required this.pin,
    required this.onPinChange,
    required this.substances,
    required this.expenses,
    required this.isFirstTimeLaunch,
    required this.onFirstTimeCompleted,
    required this.onLock,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.isFirstTimeLaunch) {
        _triggerFirstTimeOnboarding();
      }
    });
  }

  void _triggerFirstTimeOnboarding() {
    // 1. First prompt to setup 4-digit PIN or skip
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => InitialSecuritySetupDialog(
        onComplete: (newPin) {
          Navigator.of(ctx).pop();
          widget.onPinChange(newPin);
          _showTutorialModal();
        },
        onSkip: () {
          Navigator.of(ctx).pop();
          _showTutorialModal();
        },
      ),
    );
  }

  void _showTutorialModal() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => OnboardingTutorialDialog(
        onFinish: () {
          widget.onFirstTimeCompleted();
        },
      ),
    );
  }

  void _openUrgeSos() {
    showDialog(
      context: context,
      builder: (ctx) => UrgeSosDialog(isDarkMode: widget.isDarkMode),
    );
  }

  void _openAddSubstance() {
    showDialog(
      context: context,
      builder: (ctx) => AddSubstanceDialog(
        currency: widget.currency,
        onAdd: (newSubstance) {
          setState(() {
            widget.substances.add(newSubstance);
          });
        },
      ),
    );
  }

  void _openSubstanceDetail(Substance substance) {
    showDialog(
      context: context,
      builder: (ctx) => SubstanceDetailDialog(
        substance: substance,
        currency: widget.currency,
        onUpdate: (updated) {
          setState(() {});
        },
        onDelete: () {
          setState(() {
            widget.substances.removeWhere((s) => s.id == substance.id);
          });
          Navigator.of(context).pop();
        },
      ),
    );
  }

  double get _totalSaved => widget.substances.fold(0.0, (acc, s) => acc + s.moneySaved);
  double get _totalSpent => widget.expenses.fold(0.0, (acc, e) => acc + e.amount);
  double get _peakDailyBaseline => widget.substances.fold(0.0, (acc, s) => acc + s.costPerDay);

  // Quick Add 1 Unit with Slip Check-In Modal
  Future<void> _handleQuickAddUnit(Substance substance) async {
    final decision = await showDialog<SlipDecision>(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => QuickUnitSlipDialog(
        substance: substance,
        currency: widget.currency,
      ),
    );

    if (decision == null || decision == SlipDecision.cancel) {
      return;
    }

    final now = DateTime.now();
    final expense = ExpenseLog(
      id: DateTime.now().millisecondsSinceEpoch,
      substanceId: substance.id,
      substanceName: substance.name,
      amount: substance.costPerUnit,
      unitsCount: 1.0,
      note: decision == SlipDecision.resetSoberDate
          ? 'Reset sober streak (+1 ${substance.unitName})'
          : 'Slip acknowledged (+1 ${substance.unitName})',
      timestamp: now,
    );

    setState(() {
      widget.expenses.insert(0, expense);

      if (decision == SlipDecision.resetSoberDate) {
        substance.quitDate = now;
      }
    });

    if (!mounted) return;

    final snackMessage = decision == SlipDecision.resetSoberDate
        ? '+1 ${substance.unitName} logged. Sober streak reset to today.'
        : '+1 ${substance.unitName} logged. Kept sober date ("It was just a slip").';

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(snackMessage),
        backgroundColor: decision == SlipDecision.resetSoberDate ? Colors.amber[800] : const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  // Manual Custom Expense Log
  Future<void> _handleLogCustomExpense(Substance substance) async {
    final amountController = TextEditingController(text: substance.costPerUnit.toStringAsFixed(2));
    final noteController = TextEditingController();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Log Spend for ${substance.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                labelText: 'Amount (${widget.currency})',
                border: const OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: noteController,
              decoration: const InputDecoration(
                labelText: 'Note (Optional)',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Log Expense'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final amount = double.tryParse(amountController.text) ?? substance.costPerUnit;
      final expense = ExpenseLog(
        id: DateTime.now().millisecondsSinceEpoch,
        substanceId: substance.id,
        substanceName: substance.name,
        amount: amount,
        note: noteController.text.trim(),
        timestamp: DateTime.now(),
      );

      setState(() {
        widget.expenses.insert(0, expense);
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Logged ${widget.currency}${amount.toStringAsFixed(2)} for ${substance.name}'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
    }
  }

  void _resetToDefaults() {
    setState(() {
      widget.substances.clear();
      widget.substances.add(
        Substance(
          id: 1,
          name: 'Cigarettes',
          unitName: 'pack',
          costPerDay: 12.50,
          costPerUnit: 12.50,
          quitDate: DateTime.now(),
        ),
      );
      widget.expenses.clear();
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Vault reset to defaults.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;

    return Scaffold(
      drawer: SettingsDrawer(
        isDarkMode: isDark,
        onToggleTheme: widget.onToggleTheme,
        currentCurrency: widget.currency,
        onCurrencyChange: widget.onCurrencyChange,
        currentPin: widget.pin,
        onPinChange: widget.onPinChange,
        onReplayTutorial: _showTutorialModal,
        onResetData: _resetToDefaults,
      ),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: isDark ? const Color(0xFF0F1216) : Colors.white,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.shield, color: Color(0xFF10B981), size: 20),
            ),
            const SizedBox(width: 10),
            Text(
              'HabitVault',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
          ],
        ),
        actions: [
          // Urge SOS Button
          TextButton.icon(
            style: TextButton.styleFrom(
              backgroundColor: const Color(0xFF10B981).withOpacity(0.15),
              foregroundColor: const Color(0xFF10B981),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: _openUrgeSos,
            icon: const Icon(Icons.spa, size: 16),
            label: const Text('Urge SOS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
          ),
          const SizedBox(width: 6),
          // Lock Button
          if (widget.pin.isNotEmpty)
            IconButton(
              tooltip: 'Lock Vault',
              icon: const Icon(Icons.lock_outline),
              onPressed: widget.onLock,
            ),
          // Tutorial button
          IconButton(
            tooltip: 'Tutorial & Help',
            icon: const Icon(Icons.help_outline),
            onPressed: _showTutorialModal,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // 1. Daily Affirmation Banner
          DailyAffirmationBanner(isDarkMode: isDark),

          // 2. Immediate Crisis Support Bar (988 Lifeline)
          CrisisSupportBar(isDarkMode: isDark),

          // 3. Financial Summary Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [const Color(0xFF1A222D), const Color(0xFF141920)]
                    : [const Color(0xFFF0FDF4), const Color(0xFFDCFCE7)],
              ),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: isDark ? const Color(0xFF2B374A) : const Color(0xFFBBF7D0),
                width: 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'TOTAL RECOVERED SAVINGS',
                      style: TextStyle(
                        fontSize: 11,
                        letterSpacing: 0.6,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white54 : Colors.black54,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Active',
                        style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  '${widget.currency}${_totalSaved.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Peak Baseline: ${widget.currency}${_peakDailyBaseline.toStringAsFixed(2)}/day',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                    ),
                    Text(
                      'Logged Spend: ${widget.currency}${_totalSpent.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 4. Monthly Income Impact Card
          MonthlyIncomeImpactCard(
            peakDailyBaseline: _peakDailyBaseline,
            currency: widget.currency,
            isDarkMode: isDark,
          ),

          // 5. Tracked Substances Header & Add Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Tracked Substances',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              TextButton.icon(
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFF10B981),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                ),
                onPressed: _openAddSubstance,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Substance', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // 6. Substances List
          ...widget.substances.map((substance) {
            return SubstanceCard(
              substance: substance,
              currency: widget.currency,
              onQuickAddUnit: () => _handleQuickAddUnit(substance),
              onLogCustomExpense: () => _handleLogCustomExpense(substance),
              onTapCard: () => _openSubstanceDetail(substance),
            );
          }),

          const SizedBox(height: 20),
          Center(
            child: Text(
              'HabitVault — Local Encrypted Storage & Private',
              style: TextStyle(
                fontSize: 11,
                color: isDark ? Colors.white30 : Colors.black26,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
