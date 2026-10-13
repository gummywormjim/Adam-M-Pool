import 'package:flutter/material.dart';
import '../models/substance.dart';
import '../utils/substance_icons.dart';

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

  late String _selectedIcon;
  late String _selectedColor;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.substance.name);
    _unitNameController = TextEditingController(text: widget.substance.unitName);
    _unitCostController = TextEditingController(text: widget.substance.costPerUnit.toStringAsFixed(2));
    _baselineCostController = TextEditingController(text: widget.substance.costPerDay.toStringAsFixed(2));
    _selectedIcon = widget.substance.iconName;
    _selectedColor = widget.substance.colorHex;
  }

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
                                ? widget.substance.name
                                : _nameController.text.trim(),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            'Streak: ${widget.substance.streakDays} days (${widget.currency}${widget.substance.moneySaved.toStringAsFixed(2)} saved)',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF10B981),
                              fontWeight: FontWeight.w600,
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
                        labelText: 'Unit Name (e.g. pack, can)',
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
              const SizedBox(height: 14),

              // Customizable Icon Picker Section
              Text(
                'Customize Icon:',
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

              // Customizable Color Accent Section
              Text(
                'Customize Color Accent:',
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
                  backgroundColor: activeColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  widget.substance.name = _nameController.text.trim();
                  widget.substance.unitName = _unitNameController.text.trim();
                  widget.substance.costPerUnit =
                      double.tryParse(_unitCostController.text) ?? widget.substance.costPerUnit;
                  widget.substance.costPerDay =
                      double.tryParse(_baselineCostController.text) ?? widget.substance.costPerDay;
                  widget.substance.iconName = _selectedIcon;
                  widget.substance.colorHex = _selectedColor;

                  widget.onUpdate(widget.substance);
                  Navigator.of(context).pop();
                },
                child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 8),

              TextButton.icon(
                style: TextButton.styleFrom(
                  foregroundColor: Colors.red[400],
                ),
                onPressed: () {
                  widget.onDelete();
                },
                icon: const Icon(Icons.delete_outline, size: 18),
                label: const Text('Delete Substance'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
