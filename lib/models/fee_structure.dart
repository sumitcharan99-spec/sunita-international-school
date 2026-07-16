class FeeStructure {
  final String id;
  final String classId; // e.g. Class 10A
  final double tuitionFee;
  final double transportFee;
  final double examFee;
  final double otherCharges;

  FeeStructure({
    required this.id,
    required this.classId,
    required this.tuitionFee,
    this.transportFee = 0.0,
    this.examFee = 0.0,
    this.otherCharges = 0.0,
  });

  double get total => tuitionFee + transportFee + examFee + otherCharges;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'classId': classId,
      'tuitionFee': tuitionFee,
      'transportFee': transportFee,
      'examFee': examFee,
      'otherCharges': otherCharges,
    };
  }

  factory FeeStructure.fromMap(Map<String, dynamic> map, String documentId) {
    return FeeStructure(
      id: documentId,
      classId: map['classId'] ?? '',
      tuitionFee: (map['tuitionFee'] ?? 0.0).toDouble(),
      transportFee: (map['transportFee'] ?? 0.0).toDouble(),
      examFee: (map['examFee'] ?? 0.0).toDouble(),
      otherCharges: (map['otherCharges'] ?? 0.0).toDouble(),
    );
  }
}
