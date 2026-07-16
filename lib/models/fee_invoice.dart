class FeeInvoice {
  final String id;
  final String studentId;
  final String studentName;
  final String termName;
  final double amount;
  final String dueDate;
  String status;

  FeeInvoice({
    required this.id,
    required this.studentId,
    required this.studentName,
    required this.termName,
    required this.amount,
    required this.dueDate,
    this.status = 'unpaid',
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'studentId': studentId,
      'studentName': studentName,
      'termName': termName,
      'amount': amount,
      'dueDate': dueDate,
      'status': status,
    };
  }

  factory FeeInvoice.fromMap(Map<String, dynamic> map, String documentId) {
    return FeeInvoice(
      id: documentId,
      studentId: map['studentId'] ?? '',
      studentName: map['studentName'] ?? '',
      termName: map['termName'] ?? '',
      amount: (map['amount'] ?? 0.0).toDouble(),
      dueDate: map['dueDate'] ?? '',
      status: map['status'] ?? 'unpaid',
    );
  }
}
