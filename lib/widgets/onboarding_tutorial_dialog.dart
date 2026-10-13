import 'package:flutter/material.dart';

class OnboardingTutorialDialog extends StatefulWidget {
  final VoidCallback onFinish;

  const OnboardingTutorialDialog({
    super.key,
    required this.onFinish,
  });

  @override
  State<OnboardingTutorialDialog> createState() => _OnboardingTutorialDialogState();
}

class _OnboardingTutorialDialogState extends State<OnboardingTutorialDialog> {
  int _currentStep = 0;

  final List<Map<String, dynamic>> _steps = [
    {
      'title': 'Welcome to HabitVault',
      'subtitle': 'Private, judgment-free sobriety and financial recovery tracking.',
      'icon': Icons.shield,
      'color': const Color(0xFF10B981),
      'content':
          'We\'ve started your tracker with Cigarettes as your default substance and a clean sober streak set to 0 days. Everything is saved locally on your device with complete privacy.',
    },
    {
      'title': 'How to Add Spending',
      'subtitle': 'Two fast ways to record expenses and track your habit costs.',
      'icon': Icons.add_circle_outline,
      'color': const Color(0xFF3B82F6),
      'content':
          '1. Tap "+1 Unit" above any substance to instantly log a pack, can, or bottle.\n\n2. Tap "+Log" to record custom spending, past dates, or notes in your ledger.',
    },
    {
      'title': 'Peak Baseline vs. Unit Cost',
      'subtitle': 'Accurate financial recovery calculations.',
      'icon': Icons.trending_up,
      'color': const Color(0xFF8B5CF6),
      'content':
          '• Unit Cost: The actual price of an individual pack or bottle (e.g. \$12.50/pack).\n\n• Cost Baseline: What you spent at the height of your habit. HabitVault uses this baseline to calculate your true money saved each day you stay clean!',
    },
    {
      'title': 'Compassionate Slip Tracking',
      'subtitle': 'Slip-ups happen. Your streak is always in your control.',
      'icon': Icons.favorite,
      'color': const Color(0xFFEC4899),
      'content':
          'Whenever you log a unit, you can choose:\n\n• "It was just a slip, keep my sober date"\n• Or "Reset sober date to today"\n\nYou are always in control of your journey.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final step = _steps[_currentStep];
    final isLast = _currentStep == _steps.length - 1;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      backgroundColor: isDark ? const Color(0xFF1B1E24) : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: (step['color'] as Color).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(step['icon'] as IconData, color: step['color'] as Color, size: 22),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Step ${_currentStep + 1} of ${_steps.length}',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white54 : Colors.black45,
                      ),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    widget.onFinish();
                  },
                  child: const Text('Skip', style: TextStyle(color: Colors.grey)),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Text(
              step['title'] as String,
              style: TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              step['subtitle'] as String,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: isDark ? Colors.white70 : Colors.black54,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF121418) : const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                step['content'] as String,
                style: TextStyle(
                  fontSize: 13,
                  height: 1.5,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                if (_currentStep > 0)
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onPressed: () => setState(() => _currentStep--),
                    child: const Text('Back'),
                  ),
                if (_currentStep > 0) const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () {
                      if (isLast) {
                        Navigator.of(context).pop();
                        widget.onFinish();
                      } else {
                        setState(() => _currentStep++);
                      }
                    },
                    child: Text(
                      isLast ? 'Get Started' : 'Next Step',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
