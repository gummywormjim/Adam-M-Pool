import 'dart:math' as math;
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

  // Default reference income if user hasn't configured custom income yet
  static const double _defaultEstimatedIncome = 4000.0;

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

  Future<void> _handleSaveIncome([double? presetValue]) async {
    final val = presetValue ?? double.tryParse(_incomeController.text.trim());
    if (val != null && val > 0) {
      await StorageService.setMonthlyIncome(val);
      setState(() {
        _savedIncome = val;
        _incomeController.text = val.toStringAsFixed(0);
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

    final clampedIndex = _selectedFilterIndex.clamp(0, filterOptions.length - 1).toInt();
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
    final annualCost = dailyBaseline * 365.0;

    // Effective income: saved income or default reference
    final effectiveIncome = _savedIncome ?? _defaultEstimatedIncome;
    final bool isUsingEstimated = _savedIncome == null;

    final double spentPercentage = effectiveIncome > 0
        ? ((monthlyCost / effectiveIncome) * 100).clamp(0.0, 100.0).toDouble()
        : 0.0;
    final double retainedPercentage = (100.0 - spentPercentage).clamp(0.0, 100.0).toDouble();
    final double retainedAmount = math.max(0.0, effectiveIncome - monthlyCost);
    final double hourlyWage = effectiveIncome / 160.0;
    final int hoursWorkedMonthly = hourlyWage > 0 ? (monthlyCost / hourlyWage).round() : 0;

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
                              isUsingEstimated ? 'Estimated' : 'Custom',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: isUsingEstimated
                                    ? Colors.amber[700]
                                    : (isDark ? const Color(0xFFA78BFA) : const Color(0xFF7C3AED)),
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
              TextButton.icon(
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  visualDensity: VisualDensity.compact,
                ),
                onPressed: () {
                  setState(() {
                    _isEditing = !_isEditing;
                    if (_isEditing && _savedIncome != null) {
                      _incomeController.text = _savedIncome!.toStringAsFixed(0);
                    }
                  });
                },
                icon: Icon(_isEditing ? Icons.close : Icons.edit, size: 14),
                label: Text(_isEditing ? 'Close' : (isUsingEstimated ? 'Set Salary' : 'Edit'),
                    style: const TextStyle(fontSize: 12)),
              ),
            ],
          ),

          // Editing / Salary Configuration Section
          if (_isEditing) ...[
            const SizedBox(height: 12),
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
                    'Enter your monthly net take-home pay:',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Quick preset salary chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [2500.0, 4000.0, 6000.0, 8000.0].map((preset) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 6.0),
                          child: ActionChip(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            label: Text(
                              '${widget.currency}${preset.toStringAsFixed(0)}',
                              style: const TextStyle(fontSize: 11),
                            ),
                            onPressed: () => _handleSaveIncome(preset),
                          ),
                        );
                      }).toList(),
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
                            hintText: 'e.g. 4500',
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
                        onPressed: () => _handleSaveIncome(),
                        child: const Text('Save', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                      if (_savedIncome != null) ...[
                        const SizedBox(width: 4),
                        IconButton(
                          tooltip: 'Clear Custom Income',
                          icon: const Icon(Icons.delete_outline, size: 20, color: Colors.red),
                          onPressed: _handleClearIncome,
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 12),

          // Switchable Substance Chips (ALL on far left, followed by tracked items)
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

          // Monthly & Annual Numbers
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
                    '${spentPercentage.toStringAsFixed(1)}% of ${widget.currency}${effectiveIncome.toStringAsFixed(0)} ${isUsingEstimated ? "(est.)" : "monthly"}',
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

          // Dual-colored Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              height: 12,
              child: Row(
                children: [
                  if (spentPercentage > 0)
                    Expanded(
                      flex: math.max(1, (spentPercentage * 10).round()).toInt(),
                      child: Container(color: const Color(0xFFEF4444)),
                    ),
                  if (retainedPercentage > 0)
                    Expanded(
                      flex: math.max(1, (retainedPercentage * 10).round()).toInt(),
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
                    'Retained: ${retainedPercentage.toStringAsFixed(1)}% (${widget.currency}${retainedAmount.toStringAsFixed(0)})',
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
      ),
    );
  }
}
