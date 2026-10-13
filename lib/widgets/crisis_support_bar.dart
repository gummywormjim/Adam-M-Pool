import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class CrisisSupportBar extends StatelessWidget {
  final bool isDarkMode;

  const CrisisSupportBar({
    super.key,
    required this.isDarkMode,
  });

  Future<void> _callHotline(BuildContext context, String number, String label) async {
    final uri = Uri.parse('tel:$number');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
        return;
      }
    } catch (_) {}

    if (context.mounted) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text('Call $label'),
          content: Text('Dial $number directly from your phone for immediate free, confidential 24/7 support.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  Future<void> _textHotline(BuildContext context, String number, String body) async {
    final uri = Uri.parse('sms:$number?body=$body');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
        return;
      }
    } catch (_) {}

    if (context.mounted) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Text Support'),
          content: Text('Send a text message to $number to begin free, 24/7 confidential crisis messaging.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  void _showAllResources(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDarkMode ? const Color(0xFF16191F) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE11D48).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.support_agent, color: Color(0xFFE11D48), size: 22),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '24/7 Immediate Crisis Support',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: isDarkMode ? Colors.white : Colors.black87,
                              ),
                            ),
                            Text(
                              'Free • Confidential • Available Anytime',
                              style: TextStyle(
                                fontSize: 12,
                                color: isDarkMode ? Colors.white60 : Colors.black54,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  'If you are experiencing severe distress, overwhelming cravings, or need someone to talk to right now, free confidential help is just one tap away:',
                  style: TextStyle(
                    fontSize: 13,
                    height: 1.4,
                    color: isDarkMode ? Colors.white70 : Colors.black87,
                  ),
                ),
                const SizedBox(height: 16),

                // Resource 1: 988 Suicide & Crisis Lifeline
                _buildResourceTile(
                  context: ctx,
                  title: '988 Suicide & Crisis Lifeline',
                  subtitle: 'Call or text 988. Free 24/7 support across the US & Canada.',
                  icon: Icons.phone_in_talk,
                  badgeText: 'Call 988',
                  onTap: () {
                    Navigator.of(ctx).pop();
                    _callHotline(context, '988', '988 Lifeline');
                  },
                ),
                const SizedBox(height: 10),

                // Resource 2: SAMHSA National Helpline
                _buildResourceTile(
                  context: ctx,
                  title: 'SAMHSA Substance Helpline',
                  subtitle: '1-800-662-4357. Specialized substance recovery & mental health.',
                  icon: Icons.local_hospital,
                  badgeText: 'Call SAMHSA',
                  onTap: () {
                    Navigator.of(ctx).pop();
                    _callHotline(context, '18006624357', 'SAMHSA Helpline');
                  },
                ),
                const SizedBox(height: 10),

                // Resource 3: Crisis Text Line
                _buildResourceTile(
                  context: ctx,
                  title: 'Crisis Text Line',
                  subtitle: 'Text HOME to 741741 to connect with a crisis counselor by text.',
                  icon: Icons.chat_bubble_outline,
                  badgeText: 'Text 741741',
                  onTap: () {
                    Navigator.of(ctx).pop();
                    _textHotline(context, '741741', 'HOME');
                  },
                ),
                const SizedBox(height: 16),
                Center(
                  child: Text(
                    'You are not alone on this journey. Take it one moment at a time.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                      color: isDarkMode ? Colors.white38 : Colors.black38,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildResourceTile({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required String badgeText,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isDarkMode ? const Color(0xFF1E222A) : const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isDarkMode ? const Color(0xFF2C323E) : const Color(0xFFE5E7EB),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFE11D48).withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: const Color(0xFFE11D48), size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isDarkMode ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11,
                      color: isDarkMode ? Colors.white60 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFE11D48),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                badgeText,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = isDarkMode;

    return InkWell(
      onTap: () => _showAllResources(context),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1519) : const Color(0xFFFFF1F2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? const Color(0xFF4C1D2C) : const Color(0xFFFECDD3),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
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
                  Row(
                    children: [
                      Text(
                        'Crisis Support: ',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isDark ? const Color(0xFFFDA4AF) : const Color(0xFF9F1239),
                        ),
                      ),
                      Text(
                        '988 Lifeline',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : const Color(0xFF881337),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 1),
                  Text(
                    'Free, confidential 24/7 call/text • Tap for hotlines',
                    style: TextStyle(
                      fontSize: 10,
                      color: isDark ? Colors.white60 : const Color(0xFFBE123C),
                    ),
                  ),
                ],
              ),
            ),
            // Direct Call 988 Button
            InkWell(
              onTap: () => _callHotline(context, '988', '988 Lifeline'),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFE11D48),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.phone, color: Colors.white, size: 12),
                    SizedBox(width: 4),
                    Text(
                      'Call 988',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
