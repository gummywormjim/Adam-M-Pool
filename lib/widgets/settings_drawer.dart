import 'package:flutter/material.dart';

class SettingsDrawer extends StatelessWidget {
  final bool isDarkMode;
  final VoidCallback onToggleTheme;
  final String currentCurrency;
  final Function(String) onCurrencyChange;
  final String currentPin;
  final Function(String) onPinChange;
  final VoidCallback onReplayTutorial;
  final VoidCallback onResetData;

  const SettingsDrawer({
    super.key,
    required this.isDarkMode,
    required this.onToggleTheme,
    required this.currentCurrency,
    required this.onCurrencyChange,
    required this.currentPin,
    required this.onPinChange,
    required this.onReplayTutorial,
    required this.onResetData,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = isDarkMode;

    return Drawer(
      backgroundColor: isDark ? const Color(0xFF15181E) : Colors.white,
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.shield, color: Color(0xFF10B981), size: 24),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'HabitVault Settings',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    Text(
                      'Local Encrypted Storage',
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? Colors.white54 : Colors.black54,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Theme toggle
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(isDark ? Icons.dark_mode : Icons.light_mode, color: const Color(0xFF10B981)),
              title: const Text('Theme Mode', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              trailing: Switch(
                value: isDark,
                activeColor: const Color(0xFF10B981),
                onChanged: (_) => onToggleTheme(),
              ),
            ),
            const Divider(),

            // Currency
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.attach_money, color: Color(0xFF10B981)),
              title: const Text('Currency Symbol', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              trailing: DropdownButton<String>(
                value: currentCurrency,
                dropdownColor: isDark ? const Color(0xFF242830) : Colors.white,
                items: ['\$', '€', '£', '¥', '₹'].map((curr) {
                  return DropdownMenuItem(value: curr, child: Text(curr));
                }).toList(),
                onChanged: (val) {
                  if (val != null) onCurrencyChange(val);
                },
              ),
            ),
            const Divider(),

            // Security PIN
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.lock_outline, color: Color(0xFF10B981)),
              title: const Text('Security Passcode', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              subtitle: Text(
                currentPin.isEmpty ? 'No PIN set (unlocked)' : 'PIN Active (4-digit)',
                style: TextStyle(fontSize: 11, color: isDark ? Colors.white54 : Colors.black54),
              ),
              trailing: TextButton(
                onPressed: () {
                  _showChangePinDialog(context);
                },
                child: Text(currentPin.isEmpty ? 'Set PIN' : 'Change'),
              ),
            ),
            const Divider(),

            // Replay Tutorial
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.help_outline, color: Color(0xFF10B981)),
              title: const Text('Replay Onboarding Guide', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.of(context).pop();
                onReplayTutorial();
              },
            ),
            const Divider(),

            // Reset Data
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.delete_outline, color: Color(0xFFEF4444)),
              title: const Text('Reset Tracker to Defaults', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFFEF4444))),
              onTap: () {
                Navigator.of(context).pop();
                onResetData();
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showChangePinDialog(BuildContext context) {
    final pinController = TextEditingController(text: currentPin);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Change Security PIN'),
        content: TextField(
          controller: pinController,
          keyboardType: TextInputType.number,
          maxLength: 4,
          obscureText: true,
          decoration: const InputDecoration(
            labelText: '4-digit PIN (leave empty to disable)',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white),
            onPressed: () {
              onPinChange(pinController.text.trim());
              Navigator.of(ctx).pop();
            },
            child: const Text('Save PIN'),
          ),
        ],
      ),
    );
  }
}
