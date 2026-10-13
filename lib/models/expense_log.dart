class ExpenseLog {
  final int id;
  final int substanceId;
  final String substanceName;
  final double amount;
  final double unitsCount;
  final String note;
  final DateTime timestamp;

  ExpenseLog({
    required this.id,
    required this.substanceId,
    required this.substanceName,
    required this.amount,
    this.unitsCount = 1.0,
    this.note = '',
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'substance_id': substanceId,
      'substance_name': substanceName,
      'amount': amount,
      'units_count': unitsCount,
      'note': note,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory ExpenseLog.fromMap(Map<String, dynamic> map) {
    return ExpenseLog(
      id: map['id'] as int,
      substanceId: map['substance_id'] as int,
      substanceName: map['substance_name'] as String? ?? 'Item',
      amount: (map['amount'] as num?)?.toDouble() ?? 0.0,
      unitsCount: (map['units_count'] as num?)?.toDouble() ?? 1.0,
      note: map['note'] as String? ?? '',
      timestamp: DateTime.tryParse(map['timestamp'] as String? ?? '') ?? DateTime.now(),
    );
  }
}
