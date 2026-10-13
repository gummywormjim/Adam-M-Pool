import 'package:flutter/material.dart';

class CrisisSupportBar extends StatelessWidget {
  final bool isDarkMode;

  const CrisisSupportBar({
    super.key,
    required this.isDarkMode,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = isDarkMode;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1B181E) : const Color(0xFFFFF1F2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF3F1D28) : const Color(0xFFFECDD3),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFFE11D48).withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.support_agent, color: Color(0xFFE11D48), size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Immediate Support: 988 Lifeline',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : const Color(0xFF9F1239),
                  ),
                ),
                Text(
                  'Free, 24/7 confidential call or text • SAMHSA 1-800-662-4357',
                  style: TextStyle(
                    fontSize: 10,
                    color: isDark ? Colors.white60 : const Color(0xFFBE123C),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
