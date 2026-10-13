import 'dart:async';
import 'package:flutter/material.dart';

class UrgeSosDialog extends StatefulWidget {
  final bool isDarkMode;

  const UrgeSosDialog({
    super.key,
    required this.isDarkMode,
  });

  @override
  State<UrgeSosDialog> createState() => _UrgeSosDialogState();
}

class _UrgeSosDialogState extends State<UrgeSosDialog> with SingleTickerProviderStateMixin {
  int _activeTab = 0; // 0: Timer, 1: Breathing, 2: Grounding

  // Craving Delay Timer: 15 minutes (900 seconds)
  int _remainingSeconds = 900;
  bool _isTimerRunning = false;
  Timer? _timer;

  // Breathing Pacer (4-7-8)
  late AnimationController _breatheController;
  late Animation<double> _breatheAnimation;
  String _breathePhase = 'Inhale (4s)';
  Timer? _breatheTimer;
  int _breatheCycleTime = 0;

  @override
  void initState() {
    super.initState();
    _breatheController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );
    _breatheAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _breatheController, curve: Curves.easeInOut),
    );
    _startBreathingCycle();
  }

  void _startBreathingCycle() {
    _breatheTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        _breatheCycleTime = (_breatheCycleTime + 1) % 19;
        if (_breatheCycleTime < 4) {
          _breathePhase = 'Inhale deeply (4s)';
          _breatheController.forward();
        } else if (_breatheCycleTime < 11) {
          _breathePhase = 'Hold gently (7s)';
        } else {
          _breathePhase = 'Slow exhale (8s)';
          _breatheController.reverse();
        }
      });
    });
  }

  void _toggleTimer() {
    if (_isTimerRunning) {
      _timer?.cancel();
      setState(() => _isTimerRunning = false);
    } else {
      setState(() => _isTimerRunning = true);
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (_remainingSeconds > 0) {
          setState(() => _remainingSeconds--);
        } else {
          timer.cancel();
          setState(() => _isTimerRunning = false);
        }
      });
    }
  }

  void _resetTimer() {
    _timer?.cancel();
    setState(() {
      _remainingSeconds = 900;
      _isTimerRunning = false;
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _breatheTimer?.cancel();
    _breatheController.dispose();
    super.dispose();
  }

  String _formatTime(int sec) {
    final m = (sec ~/ 60).toString().padLeft(2, '0');
    final s = (sec % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      backgroundColor: isDark ? const Color(0xFF1B1E24) : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(22.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.spa, color: Color(0xFF10B981), size: 22),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Urge SOS Relief',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 14),
            // Tabs
            Row(
              children: [
                _buildTab('15-Min Delay', 0, isDark),
                const SizedBox(width: 6),
                _buildTab('4-7-8 Breath', 1, isDark),
                const SizedBox(width: 6),
                _buildTab('5-4-3-2-1', 2, isDark),
              ],
            ),
            const SizedBox(height: 18),

            // Tab Content
            if (_activeTab == 0) _buildTimerTab(isDark),
            if (_activeTab == 1) _buildBreathingTab(isDark),
            if (_activeTab == 2) _buildGroundingTab(isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String title, int idx, bool isDark) {
    final isSelected = _activeTab == idx;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _activeTab = idx),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? const Color(0xFF10B981)
                : (isDark ? const Color(0xFF242830) : const Color(0xFFF3F4F6)),
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTimerTab(bool isDark) {
    return Column(
      children: [
        Text(
          'Urges typically peak within 10–15 minutes and then fade. Wait out the wave.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.black54),
        ),
        const SizedBox(height: 18),
        Container(
          width: 140,
          height: 140,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF10B981), width: 3),
            color: isDark ? const Color(0xFF121418) : const Color(0xFFF0FDF4),
          ),
          alignment: Alignment.center,
          child: Text(
            _formatTime(_remainingSeconds),
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
        ),
        const SizedBox(height: 18),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _toggleTimer,
              icon: Icon(_isTimerRunning ? Icons.pause : Icons.play_arrow),
              label: Text(_isTimerRunning ? 'Pause' : 'Start Wave Delay'),
            ),
            const SizedBox(width: 10),
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _resetTimer,
              child: const Text('Reset'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildBreathingTab(bool isDark) {
    return Column(
      children: [
        Text(
          _breathePhase,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: Color(0xFF10B981),
          ),
        ),
        const SizedBox(height: 14),
        AnimatedBuilder(
          animation: _breatheAnimation,
          builder: (context, child) {
            return Transform.scale(
              scale: _breatheAnimation.value,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF10B981).withOpacity(0.25),
                  border: Border.all(color: const Color(0xFF10B981), width: 2),
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.air, color: Color(0xFF10B981), size: 36),
              ),
            );
          },
        ),
        const SizedBox(height: 16),
        Text(
          'Inhale 4s • Hold 7s • Exhale 8s',
          style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.black54),
        ),
      ],
    );
  }

  Widget _buildGroundingTab(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '5-4-3-2-1 Sensory Grounding:',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        _groundingItem('5 things you can see right now', isDark),
        _groundingItem('4 things you can physically touch', isDark),
        _groundingItem('3 things you can hear around you', isDark),
        _groundingItem('2 things you can smell', isDark),
        _groundingItem('1 positive thing you appreciate about yourself', isDark),
      ],
    );
  }

  Widget _groundingItem(String text, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        children: [
          const Icon(Icons.check_circle_outline, color: Color(0xFF10B981), size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black87),
            ),
          ),
        ],
      ),
    );
  }
}
