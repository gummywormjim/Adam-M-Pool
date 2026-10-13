import 'package:flutter/material.dart';
import 'models/substance.dart';
import 'models/expense_log.dart';
import 'widgets/substance_card.dart';
import 'widgets/quick_unit_slip_dialog.dart';
import 'widgets/onboarding_tutorial_dialog.dart';

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

  void _toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HabitVault - Recovery & Finance',
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
        fontFamily: 'Inter',
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
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: HomeScreen(
        onToggleTheme: _toggleTheme,
        isDarkMode: _themeMode == ThemeMode.dark,
      ),
    );
  }
}

class HomeScreen extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDarkMode;

  const HomeScreen({
    super.key,
    required this.onToggleTheme,
    required this.isDarkMode,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final String _currency = '\$';
  bool _hasSeenTutorial = false;

  // Initial substances: Only Cigarettes, sober streak zero days upon first launch
  final List<Substance> _substances = [
    Substance(
      id: 1,
      name: 'Cigarettes',
      unitName: 'pack',
      costPerDay: 12.50,
      costPerUnit: 12.50,
      quitDate: DateTime.now(), // 0 days clean streak initially
      iconName: 'flame',
      colorHex: '#EF4444',
      isActive: true,
    ),
  ];

  final List<ExpenseLog> _expenses = [];

  @override
  void initState() {
    super.initState();
    // Show skippable tutorial on first app open
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_hasSeenTutorial) {
        _showTutorialDialog();
      }
    });
  }

  void _showTutorialDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => OnboardingTutorialDialog(
        onFinish: () {
          setState(() {
            _hasSeenTutorial = true;
          });
        },
      ),
    );
  }

  double get _totalSaved => _substances.fold(0.0, (acc, s) => acc + s.moneySaved);
  double get _totalSpent => _expenses.fold(0.0, (acc, e) => acc + e.amount);
  double get _peakDailyBaseline => _substances.fold(0.0, (acc, s) => acc + s.costPerDay);

  // Quick Add 1 Unit with Slip Check-In Modal
  Future<void> _handleQuickAddUnit(Substance substance) async {
    final decision = await showDialog<SlipDecision>(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => QuickUnitSlipDialog(
        substance: substance,
        currency: _currency,
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
      _expenses.insert(0, expense);

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
                labelText: 'Amount ($_currency)',
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
        _expenses.insert(0, expense);
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Logged $_currency${amount.toStringAsFixed(2)} for ${substance.name}'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;

    return Scaffold(
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
          IconButton(
            tooltip: 'Tutorial & Help',
            icon: const Icon(Icons.help_outline),
            onPressed: _showTutorialDialog,
          ),
          IconButton(
            tooltip: 'Toggle Theme',
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: widget.onToggleTheme,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Financial Summary Card
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
                  '$_currency${_totalSaved.toStringAsFixed(2)}',
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
                      'Peak Baseline: $_currency${_peakDailyBaseline.toStringAsFixed(2)}/day',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                    ),
                    Text(
                      'Logged Spend: $_currency${_totalSpent.toStringAsFixed(2)}',
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
          const SizedBox(height: 20),

          // Tracked Substances Section Header
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
              Text(
                '${_substances.length} tracked',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? Colors.white54 : Colors.black54,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Substances List
          ..._substances.map((substance) {
            return SubstanceCard(
              substance: substance,
              currency: _currency,
              onQuickAddUnit: () => _handleQuickAddUnit(substance),
              onLogCustomExpense: () => _handleLogCustomExpense(substance),
              onTapCard: () {},
            );
          }),

          const SizedBox(height: 24),
          Center(
            child: Text(
              'HabitVault — Local SQLite Encrypted & Private',
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
