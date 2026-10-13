class Substance {
  final int id;
  String name;
  String unitName;
  double costPerDay;
  double costPerUnit;
  DateTime quitDate;
  String iconName;
  String colorHex;
  bool isActive;

  Substance({
    required this.id,
    required this.name,
    this.unitName = 'unit',
    this.costPerDay = 10.0,
    this.costPerUnit = 10.0,
    required this.quitDate,
    this.iconName = 'flame',
    this.colorHex = '#EF4444',
    this.isActive = true,
  });

  int get streakDays {
    final diff = DateTime.now().difference(quitDate).inDays;
    return diff < 0 ? 0 : diff;
  }

  int get streakHours {
    final diff = DateTime.now().difference(quitDate).inHours;
    return diff < 0 ? 0 : diff;
  }

  double get moneySaved {
    return streakDays * costPerDay;
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'unit_name': unitName,
      'cost_per_day': costPerDay,
      'cost_per_unit': costPerUnit,
      'quit_date': quitDate.toIso8601String(),
      'icon_name': iconName,
      'color_hex': colorHex,
      'is_active': isActive,
    };
  }

  factory Substance.fromMap(Map<String, dynamic> map) {
    return Substance(
      id: map['id'] as int,
      name: map['name'] as String,
      unitName: (map['unit_name'] as String?) ?? 'unit',
      costPerDay: (map['cost_per_day'] as num?)?.toDouble() ?? 10.0,
      costPerUnit: (map['cost_per_unit'] as num?)?.toDouble() ?? 10.0,
      quitDate: DateTime.tryParse(map['quit_date'] as String? ?? '') ?? DateTime.now(),
      iconName: (map['icon_name'] as String?) ?? 'flame',
      colorHex: (map['color_hex'] as String?) ?? '#EF4444',
      isActive: map['is_active'] as bool? ?? true,
    );
  }
}
