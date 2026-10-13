import 'package:flutter/material.dart';

class SecurityLockScreen extends StatefulWidget {
  final String correctPin;
  final VoidCallback onUnlock;
  final bool isDarkMode;

  const SecurityLockScreen({
    super.key,
    required this.correctPin,
    required this.onUnlock,
    required this.isDarkMode,
  });

  @override
  State<SecurityLockScreen> createState() => _SecurityLockScreenState();
}

class _SecurityLockScreenState extends State<SecurityLockScreen> {
  String _enteredPin = '';
  String _errorMessage = '';

  void _handleDigit(String digit) {
    if (_enteredPin.length >= 4) return;

    setState(() {
      _errorMessage = '';
      _enteredPin += digit;
    });

    if (_enteredPin.length == 4) {
      if (_enteredPin == widget.correctPin || widget.correctPin.isEmpty) {
        widget.onUnlock();
      } else {
        Future.delayed(const Duration(milliseconds: 200), () {
          if (mounted) {
            setState(() {
              _errorMessage = 'Incorrect Passcode';
              _enteredPin = '';
            });
          }
        });
      }
    }
  }

  void _handleDelete() {
    if (_enteredPin.isNotEmpty) {
      setState(() {
        _errorMessage = '';
        _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
      });
    }
  }

  void _handleBiometric() {
    // Quick biometric authentication simulation
    widget.onUnlock();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;
    final bgColor = isDark ? const Color(0xFF0F1216) : const Color(0xFFF3F4F6);
    final cardColor = isDark ? const Color(0xFF1B1E24) : Colors.white;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28.0, vertical: 20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Top Header
              Column(
                children: [
                  const SizedBox(height: 20),
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(Icons.shield, color: Color(0xFF10B981), size: 32),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'HabitVault Locked',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Encrypted Local Storage • Enter 4-digit PIN',
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.white60 : Colors.black54,
                    ),
                  ),
                ],
              ),

              // PIN Dots & Error
              Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(4, (index) {
                      final isFilled = _enteredPin.length > index;
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 10),
                        width: 18,
                        height: 18,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isFilled
                              ? const Color(0xFF10B981)
                              : Colors.transparent,
                          border: Border.all(
                            color: isFilled
                                ? const Color(0xFF10B981)
                                : (isDark ? Colors.white38 : Colors.black26),
                            width: 2,
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 16),
                  if (_errorMessage.isNotEmpty)
                    Text(
                      _errorMessage,
                      style: const TextStyle(
                        color: Color(0xFFEF4444),
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    )
                  else
                    const SizedBox(height: 16),
                ],
              ),

              // Keypad (1-9, Fingerprint, 0, Backspace)
              Container(
                constraints: const BoxConstraints(maxWidth: 320),
                child: Column(
                  children: [
                    for (var row = 0; row < 3; row++)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 14.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            for (var col = 1; col <= 3; col++)
                              _buildKeyButton(
                                '${row * 3 + col}',
                                cardColor,
                                isDark,
                              ),
                          ],
                        ),
                      ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        IconButton(
                          iconSize: 32,
                          icon: const Icon(Icons.fingerprint, color: Color(0xFF10B981)),
                          onPressed: _handleBiometric,
                        ),
                        _buildKeyButton('0', cardColor, isDark),
                        IconButton(
                          iconSize: 26,
                          icon: Icon(
                            Icons.backspace_outlined,
                            color: isDark ? Colors.white70 : Colors.black54,
                          ),
                          onPressed: _handleDelete,
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildKeyButton(String text, Color cardColor, bool isDark) {
    return InkWell(
      onTap: () => _handleDigit(text),
      borderRadius: BorderRadius.circular(36),
      child: Container(
        width: 68,
        height: 68,
        decoration: BoxDecoration(
          color: cardColor,
          shape: BoxShape.circle,
          border: Border.all(
            color: isDark ? const Color(0xFF2E3440) : const Color(0xFFE5E7EB),
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          text,
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
      ),
    );
  }
}
