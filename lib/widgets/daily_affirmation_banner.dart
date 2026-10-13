import 'package:flutter/material.dart';

class DailyAffirmationBanner extends StatefulWidget {
  final bool isDarkMode;

  const DailyAffirmationBanner({
    super.key,
    required this.isDarkMode,
  });

  @override
  State<DailyAffirmationBanner> createState() => _DailyAffirmationBannerState();
}

class _DailyAffirmationBannerState extends State<DailyAffirmationBanner> {
  int _currentIndex = 0;
  bool _isLiked = false;

  final List<Map<String, String>> _affirmations = [
    {
      'quote': 'Recovery isn\'t about never falling down; it\'s about refusing to stay down.',
      'author': 'Daily Recovery Vault',
    },
    {
      'quote': 'Every dollar you don\'t spend on your habit is an investment in your freedom.',
      'author': 'Financial Resilience',
    },
    {
      'quote': 'Urges are like ocean waves—they rise, peak, and always wash away. You just have to ride them out.',
      'author': 'Mindful Sobriety',
    },
    {
      'quote': 'Small steps taken every single day add up to monumental transformation.',
      'author': 'Habit Vault Principle',
    },
  ];

  void _next() {
    setState(() {
      _currentIndex = (_currentIndex + 1) % _affirmations.length;
      _isLiked = false;
    });
  }

  void _prev() {
    setState(() {
      _currentIndex = (_currentIndex - 1 + _affirmations.length) % _affirmations.length;
      _isLiked = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;
    final item = _affirmations[_currentIndex];

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1B1E24) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF2E3440) : const Color(0xFFE5E7EB),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.format_quote, color: Color(0xFF10B981), size: 20),
                  const SizedBox(width: 6),
                  Text(
                    'DAILY AFFIRMATION',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: isDark ? Colors.white60 : Colors.black54,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  IconButton(
                    iconSize: 18,
                    visualDensity: VisualDensity.compact,
                    icon: Icon(
                      _isLiked ? Icons.favorite : Icons.favorite_border,
                      color: _isLiked ? const Color(0xFFEF4444) : (isDark ? Colors.white54 : Colors.black45),
                    ),
                    onPressed: () => setState(() => _isLiked = !_isLiked),
                  ),
                  IconButton(
                    iconSize: 18,
                    visualDensity: VisualDensity.compact,
                    icon: Icon(Icons.chevron_left, color: isDark ? Colors.white54 : Colors.black45),
                    onPressed: _prev,
                  ),
                  IconButton(
                    iconSize: 18,
                    visualDensity: VisualDensity.compact,
                    icon: Icon(Icons.chevron_right, color: isDark ? Colors.white54 : Colors.black45),
                    onPressed: _next,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '"${item['quote']}"',
            style: TextStyle(
              fontSize: 13,
              height: 1.4,
              fontStyle: FontStyle.italic,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '— ${item['author']}',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF10B981),
            ),
          ),
        ],
      ),
    );
  }
}
