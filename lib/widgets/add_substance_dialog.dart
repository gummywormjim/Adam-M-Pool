import 'package:flutter/material.dart';
import '../models/substance.dart';
import '../utils/substance_icons.dart';

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
  final DateTime _quitDate = DateTime.now();

  String _selectedIcon = 'flame';
  String _selectedColor = '#EF4444';

  @override
  void dispose() {
    _nameController.dispose();
    _unitNameController.dispose();
    _unitCostController.dispose();
    _baselineCostController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final activeColor = SubstanceIconRegistry.getColor(_selectedColor);
    final activeIcon = SubstanceIconRegistry.getIcon(_selectedIcon);

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

              // Live Preview Banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF14171D) : const Color(0xFFF3F4F6),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: activeColor.withOpacity(0.4),
                    width: 1.5,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: activeColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(activeIcon, color: activeColor, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _nameController.text.trim().isEmpty
                                ? 'Habit / Substance Preview'
                                : _nameController.text.trim(),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            'Customizable Icon & Color Selected',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.white54 : Colors.black54,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              TextField(
                controller: _nameController,
                onChanged: (_) => setState(() {}),
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
                  helperText: 'How much you spent daily at the peak of your habit',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 14),

              // Customizable Icon Picker Section
              Text(
                'Choose Icon:',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white70 : Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 52,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: SubstanceIconRegistry.availableIcons.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final opt = SubstanceIconRegistry.availableIcons[index];
                    final isSelected = opt.key == _selectedIcon;
                    return Tooltip(
                      message: opt.label,
                      child: InkWell(
                        onTap: () {
                          setState(() {
                            _selectedIcon = opt.key;
                          });
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? activeColor.withOpacity(0.25)
                                : (isDark ? const Color(0xFF222730) : const Color(0xFFF3F4F6)),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? activeColor : Colors.transparent,
                              width: 2,
                            ),
                          ),
                          child: Icon(
                            opt.icon,
                            color: isSelected
                                ? activeColor
                                : (isDark ? Colors.white70 : Colors.black54),
                            size: 22,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 14),

              // Customizable Color Picker Section
              Text(
                'Choose Color Accent:',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white70 : Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 44,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: SubstanceIconRegistry.availableColors.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final opt = SubstanceIconRegistry.availableColors[index];
                    final isSelected = opt.hex == _selectedColor;
                    return InkWell(
                      onTap: () {
                        setState(() {
                          _selectedColor = opt.hex;
                        });
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: opt.color,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected ? Colors.white : Colors.transparent,
                            width: 2.5,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: opt.color.withOpacity(0.5),
                                    blurRadius: 8,
                                    spreadRadius: 1,
                                  ),
                                ]
                              : null,
                        ),
                        child: isSelected
                            ? const Icon(Icons.check, color: Colors.white, size: 20)
                            : null,
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 20),

              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: activeColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  final name = _nameController.text.trim();
                  if (name.isEmpty) return;
                  final unitName = _unitNameController.text.trim().isEmpty
                      ? 'unit'
                      : _unitNameController.text.trim();
                  final unitCost = double.tryParse(_unitCostController.text) ?? 10.0;
                  final baselineCost = double.tryParse(_baselineCostController.text) ?? 15.0;

                  final newSubstance = Substance(
                    id: DateTime.now().millisecondsSinceEpoch,
                    name: name,
                    unitName: unitName,
                    costPerUnit: unitCost,
                    costPerDay: baselineCost,
                    quitDate: _quitDate,
                    iconName: _selectedIcon,
                    colorHex: _selectedColor,
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
