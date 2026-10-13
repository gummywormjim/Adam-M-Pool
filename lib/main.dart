import 'package:flutter/material.dart';
import 'models/substance.dart';
import 'models/expense_log.dart';
import 'services/storage_service.dart';
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
import 'widgets/expense_ledger_dialog.dart';
import 'widgets/settings_drawer.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await StorageService.init();
  runApp(const HabitVaultApp());
}

class HabitVaultApp extends StatefulWidget {
  const HabitVaultApp({super.key});

  @override
  State<HabitVaultApp> createState() => _HabitVaultAppState();
}

class _HabitVaultAppState extends State<HabitVaultApp> with WidgetsBindingObserver {
  late ThemeMode _themeMode;
  late String _pin;
  late bool _isLocked;
  late bool _isFirstTimeLaunch;
  late String _currency;
  late List<Substance> _substances;
  late List<ExpenseLog> _expenses;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    // Initialize from persistent storage
    final savedMode = StorageService.getThemeMode();
    _themeMode = savedMode == 'light' ? ThemeMode.light : ThemeMode.dark;
    _pin = StorageService.getPin();
    _isFirstTimeLaunch = StorageService.isFirstTimeLaunch();
    _currency = StorageService.getCurrency();
    _substances = StorageService.getSubstances();
    _expenses = StorageService.getExpenses();

    // Security system: automatically lock upon opening if PIN exists
    _isLocked = StorageService.isSecurityEnabled() && _pin.isNotEmpty;
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Automatically re-lock the vault when minimized or backgrounded
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      if (_pin.isNotEmpty && StorageService.isSecurityEnabled()) {
        setState(() {
          _isLocked = true;
        });
      }
    }
  }

  void _toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
      StorageService.setThemeMode(_themeMode == ThemeMode.dark ? 'dark' : 'light');
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

  void _handlePinChange(String newPin) {
    setState(() {
      _pin = newPin;
      StorageService.setPin(newPin);
    });
  }

  void _handleCurrencyChange(String newCurrency) {
    setState(() {
      _currency = newCurrency;
      StorageService.setCurrency(newCurrency);
    });
  }

  void _persistSubstances() {
    StorageService.saveSubstances(_substances);
  }

  void _persistExpenses() {
    StorageService.saveExpenses(_expenses);
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
              onCurrencyChange: _handleCurrencyChange,
              pin: _pin,
              onPinChange: _handlePinChange,
              substances: _substances,
              expenses: _expenses,
              onSubstancesUpdated: _persistSubstances,
              onExpensesUpdated: _persistExpenses,
              isFirstTimeLaunch: _isFirstTimeLaunch,
              onFirstTimeCompleted: () {
                setState(() => _isFirstTimeLaunch = false);
                StorageService.setFirstTimeLaunch(false);
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
  final VoidCallback onSubstancesUpdated;
  final VoidCallback onExpensesUpdated;
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
    required this.onSubstancesUpdated,
    required this.onExpensesUpdated,
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
    // Prompt to create 4-digit security PIN or skip
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

  void _openSecuritySetup() {
    showDialog(
      context: context,
      builder: (ctx) => InitialSecuritySetupDialog(
        onComplete: (newPin) {
          Navigator.of(ctx).pop();
          widget.onPinChange(newPin);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Security PIN set! Your vault will auto-lock upon launch or when locked.'),
              backgroundColor: Color(0xFF10B981),
            ),
          );
        },
        onSkip: () => Navigator.of(ctx).pop(),
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
          widget.onSubstancesUpdated();
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
          widget.onSubstancesUpdated();
        },
        onDelete: () {
          setState(() {
            widget.substances.removeWhere((s) => s.id == substance.id);
          });
          widget.onSubstancesUpdated();
        },
      ),
    );
  }

  void _openExpenseLedger() {
    showDialog(
      context: context,
      builder: (ctx) => ExpenseLedgerDialog(
        expenses: widget.expenses,
        currency: widget.currency,
        onDeleteExpense: (expenseId) {
          setState(() {
            widget.expenses.removeWhere((e) => e.id == expenseId);
          });
          widget.onExpensesUpdated();
        },
        onClearAll: () {
          setState(() {
            widget.expenses.clear();
          });
          widget.onExpensesUpdated();
        },
      ),
    );
  }

  double get _totalSaved => widget.substances.fold(0.0, (acc, s) => acc + s.moneySaved);
  double get _totalSpent => widget.expenses.fold(0.0, (acc, e) => acc + e.amount);
  double get _peakDailyBaseline => widget.substances.fold(0.0, (acc, s) => acc + s.costPerDay);
  double get _netSaved {
    final net = _totalSaved - _totalSpent;
    return net < 0 ? 0.0 : net;
  }

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

    widget.onExpensesUpdated();
    widget.onSubstancesUpdated();

    if (!mounted) return;

    final snackMessage = decision == SlipDecision.resetSoberDate
        ? '+1 ${substance.unitName} logged. Sober streak reset to today.'
        : '+1 ${substance.unitName} logged. Kept sober date ("It was just a slip").';

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(snackMessage),
        backgroundColor:
            decision == SlipDecision.resetSoberDate ? Colors.amber[800] : const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
      ),
    );
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
          iconName: 'smoke',
          colorHex: '#EF4444',
          isActive: true,
        ),
      );
      widget.expenses.clear();
    });
    widget.onSubstancesUpdated();
    widget.onExpensesUpdated();
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
          // Lock / Security Button
          if (widget.pin.isNotEmpty)
            IconButton(
              tooltip: 'Lock Vault Now',
              icon: const Icon(Icons.lock_outline, color: Color(0xFF10B981)),
              onPressed: widget.onLock,
            )
          else
            IconButton(
              tooltip: 'Set Security PIN',
              icon: const Icon(Icons.lock_open_outlined, color: Colors.amber),
              onPressed: _openSecuritySetup,
            ),
          // Tutorial button
          IconButton(
            tooltip: 'Tutorial & Help',
            icon: const Icon(Icons.help_outline),
            onPressed: _showTutorialModal,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 1. PINNED AT THE VERY TOP: 24/7 Immediate Crisis Support Bar (988 Lifeline)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
              child: CrisisSupportBar(isDarkMode: isDark),
            ),

            // Scrollable body content
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 6, 16, 24),
                children: [
                  // 2. Daily Affirmation Banner
                  DailyAffirmationBanner(isDarkMode: isDark),
                  const SizedBox(height: 12),

                  // 3. CENTERED URGE SOS BUTTON UNDER DAILY AFFIRMATIONS
                  Center(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEF4444),
                        foregroundColor: Colors.white,
                        elevation: 3,
                        shadowColor: const Color(0xFFEF4444).withOpacity(0.4),
                        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                      ),
                      onPressed: _openUrgeSos,
                      icon: const Icon(Icons.flash_on, size: 20),
                      label: const Text(
                        'URGE SOS',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // 4. Financial Summary Card with Spending Tracking over Time
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
                                style: TextStyle(
                                  color: Color(0xFF10B981),
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
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
                            InkWell(
                              onTap: _openExpenseLedger,
                              borderRadius: BorderRadius.circular(8),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      'Logged Spend: ${widget.currency}${_totalSpent.toStringAsFixed(2)}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: _totalSpent > 0 ? const Color(0xFFEF4444) : (isDark ? Colors.white70 : Colors.black87),
                                        decoration: TextDecoration.underline,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.receipt_long, size: 14, color: Color(0xFFEF4444)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        if (_totalSpent > 0) ...[
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Net Preserved Freedom:',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? Colors.white54 : Colors.black54,
                                ),
                              ),
                              Text(
                                '${widget.currency}${_netSaved.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF10B981),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // 5. Fully Interactive Monthly Income Impact Card
                  MonthlyIncomeImpactCard(
                    substances: widget.substances,
                    peakDailyBaseline: _peakDailyBaseline,
                    currency: widget.currency,
                    isDarkMode: isDark,
                    onIncomeChanged: () => setState(() {}),
                  ),

                  // 6. Tracked Substances Header & Add Button
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

                  // 7. Substances List (with customizable icons/colors & no "+Log" button)
                  ...widget.substances.map((substance) {
                    return SubstanceCard(
                      substance: substance,
                      currency: widget.currency,
                      onQuickAddUnit: () => _handleQuickAddUnit(substance),
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
            ),
          ],
        ),
      ),
    );
  }
}
