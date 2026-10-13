import 'package:flutter/material.dart';
import '../models/substance.dart';

enum SlipDecision {
  keepSoberDate,
  resetSoberDate,
  cancel,
}

class QuickUnitSlipDialog extends StatelessWidget {
  final Substance substance;
  final String currency;

  const QuickUnitSlipDialog({
    super.key,
    required this.substance,
    this.currency = '\$',
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final costDisplay = '$currency${substance.costPerUnit.toStringAsFixed(2)} / ${substance.unitName}';

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: isDark ? const Color(0xFF1E2229) : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.amber.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.shield_outlined, color: Colors.amber, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Log 1 ${substance.unitName} (${substance.name})',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      Text(
                        costDisplay,
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? Colors.white70 : Colors.black54,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.of(context).pop(SlipDecision.cancel),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Text(
              'Would you like to reset your sober date?',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Current clean streak: ${substance.streakDays} days. Recovery isn\'t all-or-nothing—choose what supports your journey best.',
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white60 : Colors.black54,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              onPressed: () => Navigator.of(context).pop(SlipDecision.keepSoberDate),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.favorite, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'It was just a slip, keep my sober date',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            // Option 2: Reset sober date
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.amber[700],
                side: BorderSide(color: Colors.amber.shade700, width: 1.5),
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: () => Navigator.of(context).pop(SlipDecision.resetSoberDate),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.restart_alt, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Reset sober date to today',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
            TextButton(
              onPressed: () => Navigator.of(context).pop(SlipDecision.cancel),
              child: Text(
                'Cancel (don\'t log)',
                style: TextStyle(color: isDark ? Colors.white54 : Colors.black45, fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
