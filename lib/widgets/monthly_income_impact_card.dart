import 'package:flutter/material.dart';
import '../models/substance.dart';
import '../services/storage_service.dart';

class MonthlyIncomeImpactCard extends StatefulWidget {
  final List<Substance> substances;
  final double peakDailyBaseline;
  final String currency;
  final bool isDarkMode;
  final VoidCallback? onIncomeChanged;

  const MonthlyIncomeImpactCard({
    super.key,
    required this.substances,
    required this.peakDailyBaseline,
    this.currency = '\$',
    required this.isDarkMode,
    this.onIncomeChanged,
  });

  @override
  State<MonthlyIncomeImpactCard> createState() => _MonthlyIncomeImpactCardState();
}

class _MonthlyIncomeImpactCardState extends State<MonthlyIncomeImpactCard> {
  double? _savedIncome;
  bool _isEditing = false;
  final TextEditingController _incomeController = TextEditingController();
  int _selectedFilterIndex = 0; // 0: ALL, 1+: substances index + 1

  @override
  void initState() {
    super.initState();
    _loadSavedIncome();
  }

  void _loadSavedIncome() {
    final income = StorageService.getMonthlyIncome();
    setState(() {
      _savedIncome = income;
      if (income != null) {
        _incomeController.text = income.toStringAsFixed(0);
      }
    });
  }

  Future<void> _handleSaveIncome() async {
    final text = _incomeController.text.trim();
    final val = double.tryParse(text);
    if (val != null && val > 0) {
      await StorageService.setMonthlyIncome(val);
      setState(() {
        _savedIncome = val;
        _isEditing = false;
      });
      widget.onIncomeChanged?.call();
    }
  }

  Future<void> _handleClearIncome() async {
    await StorageService.setMonthlyIncome(null);
    setState(() {
      _savedIncome = null;
      _isEditing = false;
      _incomeController.clear();
    });
    widget.onIncomeChanged?.call();
  }

  @override
  void dispose() {
    _incomeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;

    // Build filter items: ALL first, followed by each tracked substance
    final filterOptions = <Map<String, dynamic>>[
      {'id': 'ALL', 'name': 'ALL', 'substance': null},
      ...widget.substances.map((s) => {'id': s.id.toString(), 'name': s.name, 'substance': s}),
    ];

    final clampedIndex = _selectedFilterIndex.clamp(0, filterOptions.length - 1);
    final selectedOption = filterOptions[clampedIndex];
    final isAllSelected = selectedOption['id'] == 'ALL';
    final selectedSubstance = selectedOption['substance'] as Substance?;

    // Financial calculations
    final double dailyBaseline;
    if (isAllSelected) {
      dailyBaseline = widget.peakDailyBaseline;
    } else if (selectedSubstance != null) {
      dailyBaseline = selectedSubstance.costPerDay;
    } else {
      dailyBaseline = widget.peakDailyBaseline;
    }

    final monthlyCost = dailyBaseline * 30.4;
    final annualCost = dailyBaseline * 365;

    // Percentages against user monthly income
    final double spentPercentage;
    final double retainedPercentage;
    final int hoursWorkedMonthly;
    final double retainedAmount;

    if (_savedIncome != null && _savedIncome! > 0) {
      spentPercentage = ((monthlyCost / _savedIncome!) * 100).clamp(0.0, 100.0);
      retainedPercentage = (100.0 - spentPercentage).clamp(0.0, 100.0);
      retainedAmount = (_savedIncome! - monthlyCost).clamp(0.0, double.infinity);
      final hourlyWage = _savedIncome! / 160.0;
      hoursWorkedMonthly = hourlyWage > 0 ? (monthlyCost / hourlyWage).round() : 0;
    } else {
      spentPercentage = 0.0;
      retainedPercentage = 100.0;
      retainedAmount = 0.0;
      hoursWorkedMonthly = (monthlyCost / 20.0).round();
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1B1E24) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF2E3440) : const Color(0xFFE5E7EB),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: const Color(0xFF8B5CF6).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.account_balance_wallet, color: Color(0xFF8B5CF6), size: 18),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Monthly Income Impact',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF2A2E39) : const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Interactive',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: isDark ? const Color(0xFFA78BFA) : const Color(0xFF7C3AED),
                              ),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Percentage of income spent vs retained for freedom',
                        style: TextStyle(
                          fontSize: 10,
                          color: isDark ? Colors.white60 : Colors.black54,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              if (_savedIncome != null && !_isEditing)
                TextButton.icon(
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    visualDensity: VisualDensity.compact,
                  ),
                  onPressed: () {
                    setState(() {
                      _isEditing = true;
                      _incomeController.text = _savedIncome!.toStringAsFixed(0);
                    });
                  },
                  icon: const Icon(Icons.edit, size: 14),
                  label: const Text('Edit', style: TextStyle(fontSize: 12)),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // Setup / Editing State
          if (_savedIncome == null || _isEditing) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF14161C) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? const Color(0xFF2B303C) : const Color(0xFFE5E7EB),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Enter your monthly net take-home income:',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _incomeController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          textInputAction: TextInputAction.done,
                          onSubmitted: (_) => _handleSaveIncome(),
                          decoration: InputDecoration(
                            prefixText: '${widget.currency} ',
                            hintText: 'e.g. 4000',
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                        ),
                        onPressed: _handleSaveIncome,
                        child: const Text('Save', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                      if (_isEditing) ...[
                        const SizedBox(width: 6),
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 11),
                          ),
                          onPressed: () {
                            setState(() {
                              _isEditing = false;
                            });
                          },
                          child: const Text('Cancel'),
                        ),
                        const SizedBox(width: 6),
                        IconButton(
                          tooltip: 'Clear Income',
                          icon: const Icon(Icons.delete_outline, size: 20, color: Colors.red),
                          onPressed: _handleClearIncome,
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ] else ...[
            // Switchable Substance Chips (ALL on far left)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: List.generate(filterOptions.length, (idx) {
                  final opt = filterOptions[idx];
                  final isSelected = idx == clampedIndex;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6.0),
                    child: FilterChip(
                      selected: isSelected,
                      showCheckmark: false,
                      label: Text(
                        opt['name'] as String,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected
                              ? Colors.white
                              : (isDark ? Colors.white70 : Colors.black87),
                        ),
                      ),
                      backgroundColor: isDark ? const Color(0xFF14171D) : const Color(0xFFF3F4F6),
                      selectedColor: const Color(0xFF8B5CF6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      onSelected: (_) {
                        setState(() {
                          _selectedFilterIndex = idx;
                        });
                      },
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 12),

            // Big Numbers & Progress Impact
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${widget.currency}${monthlyCost.toStringAsFixed(2)} / month',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${spentPercentage.toStringAsFixed(1)}% of ${widget.currency}${_savedIncome!.toStringAsFixed(0)} monthly income',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFEF4444),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${widget.currency}${annualCost.toStringAsFixed(0)} / yr',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFEF4444),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Visual Dual-colored Progress Bar
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: SizedBox(
                height: 12,
                child: Row(
                  children: [
                    if (spentPercentage > 0)
                      Expanded(
                        flex: (spentPercentage * 10).round().clamp(1, 1000),
                        child: Container(color: const Color(0xFFEF4444)),
                      ),
                    if (retainedPercentage > 0)
                      Expanded(
                        flex: (retainedPercentage * 10).round().clamp(1, 1000),
                        child: Container(color: const Color(0xFF10B981)),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFEF4444))),
                    const SizedBox(width: 4),
                    Text(
                      'Spent: ${spentPercentage.toStringAsFixed(1)}%',
                      style: TextStyle(fontSize: 10, color: isDark ? Colors.white60 : Colors.black54),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFF10B981))),
                    const SizedBox(width: 4),
                    Text(
                      'Retained Freedom: ${retainedPercentage.toStringAsFixed(1)}% (${widget.currency}${retainedAmount.toStringAsFixed(0)})',
                      style: const TextStyle(fontSize: 10, color: Color(0xFF10B981), fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Labor Hours Info
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF14171E) : const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.work_outline, size: 14, color: Color(0xFF8B5CF6)),
                  const SizedBox(width: 6),
                  Text(
                    'Equivalent to ~$hoursWorkedMonthly hours of labor every month',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
