import 'package:flutter/material.dart';

class SubstanceIconOption {
  final String key;
  final String label;
  final IconData icon;

  const SubstanceIconOption(this.key, this.label, this.icon);
}

class SubstanceColorOption {
  final String hex;
  final String label;
  final Color color;

  const SubstanceColorOption(this.hex, this.label, this.color);
}

class SubstanceIconRegistry {
  static const List<SubstanceIconOption> availableIcons = [
    SubstanceIconOption('flame', 'Flame', Icons.local_fire_department),
    SubstanceIconOption('beer', 'Alcohol', Icons.local_bar),
    SubstanceIconOption('wine', 'Wine', Icons.wine_bar),
    SubstanceIconOption('smoke', 'Smoking', Icons.smoking_rooms),
    SubstanceIconOption('pill', 'Pills', Icons.medication),
    SubstanceIconOption('coffee', 'Caffeine', Icons.coffee),
    SubstanceIconOption('leaf', 'Herb', Icons.spa),
    SubstanceIconOption('gaming', 'Gaming', Icons.sports_esports),
    SubstanceIconOption('shopping', 'Shopping', Icons.shopping_bag),
    SubstanceIconOption('casino', 'Gambling', Icons.casino),
    SubstanceIconOption('fastfood', 'Junk Food', Icons.fastfood),
    SubstanceIconOption('phone', 'Screens', Icons.phone_android),
    SubstanceIconOption('bolt', 'Impulse', Icons.bolt),
    SubstanceIconOption('heart', 'Wellness', Icons.favorite),
    SubstanceIconOption('shield', 'Protection', Icons.shield),
    SubstanceIconOption('fitness', 'Fitness', Icons.fitness_center),
  ];

  static const List<SubstanceColorOption> availableColors = [
    SubstanceColorOption('#EF4444', 'Red', Color(0xFFEF4444)),
    SubstanceColorOption('#F97316', 'Orange', Color(0xFFF97316)),
    SubstanceColorOption('#F59E0B', 'Amber', Color(0xFFF59E0B)),
    SubstanceColorOption('#10B981', 'Emerald', Color(0xFF10B981)),
    SubstanceColorOption('#14B8A6', 'Teal', Color(0xFF14B8A6)),
    SubstanceColorOption('#3B82F6', 'Blue', Color(0xFF3B82F6)),
    SubstanceColorOption('#6366F1', 'Indigo', Color(0xFF6366F1)),
    SubstanceColorOption('#8B5CF6', 'Purple', Color(0xFF8B5CF6)),
    SubstanceColorOption('#EC4899', 'Pink', Color(0xFFEC4899)),
    SubstanceColorOption('#64748B', 'Slate', Color(0xFF64748B)),
  ];

  static IconData getIcon(String? key) {
    if (key == null || key.isEmpty) return Icons.local_fire_department;
    for (final opt in availableIcons) {
      if (opt.key.toLowerCase() == key.toLowerCase()) {
        return opt.icon;
      }
    }
    switch (key.toLowerCase()) {
      case 'fire':
        return Icons.local_fire_department;
      case 'drink':
      case 'bar':
        return Icons.local_bar;
      case 'cigarettes':
      case 'vape':
        return Icons.smoking_rooms;
      case 'meds':
      case 'drug':
        return Icons.medication;
      case 'weed':
      case 'cannabis':
        return Icons.spa;
      case 'game':
        return Icons.sports_esports;
      case 'money':
        return Icons.shopping_bag;
      case 'bets':
        return Icons.casino;
      case 'sugar':
      case 'food':
        return Icons.fastfood;
      default:
        return Icons.local_fire_department;
    }
  }

  static Color getColor(String? hex) {
    if (hex == null || hex.isEmpty) return const Color(0xFFEF4444);
    String cleanHex = hex.replaceAll('#', '').trim();
    if (cleanHex.length == 6) {
      cleanHex = 'FF' + cleanHex;
    }
    final int? val = int.tryParse(cleanHex, radix: 16);
    if (val != null) {
      return Color(val);
    }
    return const Color(0xFFEF4444);
  }
}
