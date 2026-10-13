import 'package:flutter/material.dart';

class InitialSecuritySetupDialog extends StatefulWidget {
  final Function(String pin) onComplete;
  final VoidCallback onSkip;

  const InitialSecuritySetupDialog({
    super.key,
    required this.onComplete,
    required this.onSkip,
  });

  @override
  State<InitialSecuritySetupDialog> createState() => _InitialSecuritySetupDialogState();
}

class _InitialSecuritySetupDialogState extends State<InitialSecuritySetupDialog> {
  int _step = 0; // 0: create, 1: confirm
  String _pin = '';
  String _confirmPin = '';
  String _error = '';

  void _handleDigit(String digit) {
    if (_step == 0) {
      if (_pin.length >= 4) return;
      setState(() {
        _error = '';
        _pin += digit;
      });
      if (_pin.length == 4) {
        Future.delayed(const Duration(milliseconds: 200), () {
          if (mounted) setState(() => _step = 1);
        });
      }
    } else {
      if (_confirmPin.length >= 4) return;
      setState(() {
        _error = '';
        _confirmPin += digit;
      });
      if (_confirmPin.length == 4) {
        if (_confirmPin == _pin) {
          widget.onComplete(_pin);
        } else {
          setState(() {
            _error = 'PINs do not match. Try again.';
            _confirmPin = '';
          });
        }
      }
    }
  }

  void _handleDelete() {
    setState(() {
      _error = '';
      if (_step == 0 && _pin.isNotEmpty) {
        _pin = _pin.substring(0, _pin.length - 1);
      } else if (_step == 1 && _confirmPin.isNotEmpty) {
        _confirmPin = _confirmPin.substring(0, _confirmPin.length - 1);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final currentPin = _step == 0 ? _pin : _confirmPin;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      backgroundColor: isDark ? const Color(0xFF1B1E24) : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.shield, color: Color(0xFF10B981), size: 24),
                ),
                TextButton(
                  onPressed: widget.onSkip,
                  child: const Text('Skip for Now', style: TextStyle(color: Colors.grey)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              _step == 0 ? 'Create Security Passcode' : 'Confirm Your Passcode',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _step == 0
                  ? 'Set a 4-digit PIN to lock your recovery and financial data.'
                  : 'Re-enter your 4-digit PIN to confirm.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white60 : Colors.black54,
              ),
            ),
            const SizedBox(height: 20),
            // Dots
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(4, (index) {
                final isFilled = currentPin.length > index;
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isFilled ? const Color(0xFF10B981) : Colors.transparent,
                    border: Border.all(
                      color: isFilled ? const Color(0xFF10B981) : Colors.grey,
                      width: 2,
                    ),
                  ),
                );
              }),
            ),
            if (_error.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                _error,
                style: const TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ],
            const SizedBox(height: 20),
            // Keypad
            Container(
              constraints: const BoxConstraints(maxWidth: 240),
              child: Column(
                children: [
                  for (var row = 0; row < 3; row++)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          for (var col = 1; col <= 3; col++)
                            _buildKeyButton('${row * 3 + col}', isDark),
                        ],
                      ),
                    ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      const SizedBox(width: 52),
                      _buildKeyButton('0', isDark),
                      IconButton(
                        icon: const Icon(Icons.backspace_outlined),
                        onPressed: _handleDelete,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKeyButton(String text, bool isDark) {
    return InkWell(
      onTap: () => _handleDigit(text),
      borderRadius: BorderRadius.circular(28),
      child: Container(
        width: 54,
        height: 54,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF242830) : const Color(0xFFF3F4F6),
          shape: BoxShape.circle,
        ),
        alignment: Alignment.center,
        child: Text(
          text,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
      ),
    );
  }
}
