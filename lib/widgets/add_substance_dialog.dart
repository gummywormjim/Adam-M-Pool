import 'package:flutter/material.dart';
import '../models/substance.dart';

class AddSubstanceDialog extends StatefulWidget {
  final Function(Substance) onAdd;
  final String currency;

  const AddSubstanceDialog({
    super.key,
    required this.onAdd,
    this.currency = '\$',
  });

  @override
  State<AddSubstanceDialog> createState() => _AddSubstanceDialogState();
}

class _AddSubstanceDialogState extends State<AddSubstanceDialog> {
  final _nameController = TextEditingController();
  final _unitNameController = TextEditingController(text: 'unit');
  final _unitCostController = TextEditingController(text: '10.00');
  final _baselineCostController = TextEditingController(text: '15.00');
  DateTime _quitDate = DateTime.now();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: isDark ? const Color(0xFF1B1E24) : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(22.0),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Track New Substance',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Substance Name (e.g. Alcohol, Vaping)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _unitNameController,
                      decoration: InputDecoration(
                        labelText: 'Unit (e.g. drink, can)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _unitCostController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: 'Unit Cost (${widget.currency})',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _baselineCostController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: 'Peak Daily Spend Baseline (${widget.currency}/day)',
                  helperText: 'How much you spent per day at the height of your habit',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 18),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  final name = _nameController.text.trim();
                  if (name.isEmpty) return;

                  final unitName = _unitNameController.text.trim().isEmpty ? 'unit' : _unitNameController.text.trim();
                  final unitCost = double.tryParse(_unitCostController.text) ?? 10.0;
                  final baselineCost = double.tryParse(_baselineCostController.text) ?? 15.0;

                  final newSubstance = Substance(
                    id: DateTime.now().millisecondsSinceEpoch,
                    name: name,
                    unitName: unitName,
                    costPerUnit: unitCost,
                    costPerDay: baselineCost,
                    quitDate: _quitDate,
                  );

                  widget.onAdd(newSubstance);
                  Navigator.of(context).pop();
                },
                child: const Text('Add to Tracker', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
