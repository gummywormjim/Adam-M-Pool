import 'package:flutter/material.dart';
import '../models/substance.dart';

class SubstanceDetailDialog extends StatefulWidget {
  final Substance substance;
  final String currency;
  final Function(Substance) onUpdate;
  final VoidCallback onDelete;

  const SubstanceDetailDialog({
    super.key,
    required this.substance,
    this.currency = '\$',
    required this.onUpdate,
    required this.onDelete,
  });

  @override
  State<SubstanceDetailDialog> createState() => _SubstanceDetailDialogState();
}

class _SubstanceDetailDialogState extends State<SubstanceDetailDialog> {
  late TextEditingController _nameController;
  late TextEditingController _unitNameController;
  late TextEditingController _unitCostController;
  late TextEditingController _baselineCostController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.substance.name);
    _unitNameController = TextEditingController(text: widget.substance.unitName);
    _unitCostController = TextEditingController(text: widget.substance.costPerUnit.toStringAsFixed(2));
    _baselineCostController = TextEditingController(text: widget.substance.costPerDay.toStringAsFixed(2));
  }

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
                    '${widget.substance.name} Settings',
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
                  labelText: 'Substance Name',
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
                        labelText: 'Unit Name (e.g. pack)',
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
                  labelText: 'Peak Daily Baseline (${widget.currency}/day)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.amber[700],
                  side: BorderSide(color: Colors.amber.shade700),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  setState(() {
                    widget.substance.quitDate = DateTime.now();
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Clean streak counter reset to today.')),
                  );
                },
                icon: const Icon(Icons.restart_alt, size: 18),
                label: const Text('Reset Sober Date to Today'),
              ),
              const SizedBox(height: 10),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  widget.substance.name = _nameController.text.trim();
                  widget.substance.unitName = _unitNameController.text.trim();
                  widget.substance.costPerUnit = double.tryParse(_unitCostController.text) ?? widget.substance.costPerUnit;
                  widget.substance.costPerDay = double.tryParse(_baselineCostController.text) ?? widget.substance.costPerDay;
                  widget.onUpdate(widget.substance);
                  Navigator.of(context).pop();
                },
                child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
