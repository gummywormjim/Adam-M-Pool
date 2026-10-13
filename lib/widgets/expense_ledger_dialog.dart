import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/expense_log.dart';

class ExpenseLedgerDialog extends StatefulWidget {
  final List<ExpenseLog> expenses;
  final String currency;
  final Function(int) onDeleteExpense;
  final VoidCallback onClearAll;

  const ExpenseLedgerDialog({
    super.key,
    required this.expenses,
    required this.currency,
    required this.onDeleteExpense,
    required this.onClearAll,
  });

  @override
  State<ExpenseLedgerDialog> createState() => _ExpenseLedgerDialogState();
}

class _ExpenseLedgerDialogState extends State<ExpenseLedgerDialog> {
  final DateFormat _dateFormat = DateFormat('MMM d, y • h:mm a');

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final totalSpent = widget.expenses.fold(0.0, (acc, e) => acc + e.amount);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: isDark ? const Color(0xFF1B1E24) : Colors.white,
      child: Container(
        constraints: const BoxConstraints(maxHeight: 560, maxWidth: 420),
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.receipt_long, color: Color(0xFFEF4444), size: 20),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Spending History',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                        Text(
                          'Total Logged: ${widget.currency}${totalSpent.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFEF4444),
                          ),
                        ),
                      ],
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
            Expanded(
              child: widget.expenses.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.savings_outlined,
                            size: 48,
                            color: isDark ? Colors.white24 : Colors.black26,
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'No Logged Spending',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white70 : Colors.black54,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Whenever you log a unit or slip,\nit will appear here in your ledger.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.white38 : Colors.black38,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      itemCount: widget.expenses.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final expense = widget.expenses[index];
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF14171D) : const Color(0xFFF9FAFB),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isDark ? const Color(0xFF2B323D) : const Color(0xFFE5E7EB),
                            ),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          expense.substanceName,
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                            color: isDark ? Colors.white : Colors.black87,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          '(${expense.unitsCount.toStringAsFixed(0)} unit)',
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: isDark ? Colors.white54 : Colors.black54,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      _dateFormat.format(expense.timestamp),
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: isDark ? Colors.white38 : Colors.black38,
                                      ),
                                    ),
                                    if (expense.note.isNotEmpty) ...[
                                      const SizedBox(height: 2),
                                      Text(
                                        expense.note,
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontStyle: FontStyle.italic,
                                          color: isDark ? Colors.white60 : Colors.black54,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              Text(
                                '${widget.currency}${expense.amount.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: Color(0xFFEF4444),
                                ),
                              ),
                              const SizedBox(width: 4),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, size: 18),
                                color: isDark ? Colors.white38 : Colors.black38,
                                onPressed: () {
                                  widget.onDeleteExpense(expense.id);
                                  setState(() {});
                                },
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
            if (widget.expenses.isNotEmpty) ...[
              const SizedBox(height: 12),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red[400],
                  side: BorderSide(color: Colors.red.withOpacity(0.4)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                ),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (confirmCtx) => AlertDialog(
                      title: const Text('Clear All Spending?'),
                      content: const Text(
                        'This will permanently reset your logged spend records to $0.00. Your clean streaks and saved amounts will remain intact.',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(confirmCtx).pop(),
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
                          onPressed: () {
                            Navigator.of(confirmCtx).pop();
                            widget.onClearAll();
                            setState(() {});
                          },
                          child: const Text('Clear All', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  );
                },
                icon: const Icon(Icons.delete_sweep, size: 18),
                label: const Text('Clear All Spending Records'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
