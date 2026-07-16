class AppUser {
  final String id;
  final String name;
  final String email;
  final String role; // 'admin' | 'teacher' | 'student' | 'parent'
  final String? classId;
  final String? studentId;
  final String? phone;
  final String? admissionNo;
  final String? rollNo;

  AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.classId,
    this.studentId,
    this.phone,
    this.admissionNo,
    this.rollNo,
  });

  factory AppUser.fromMap(Map<String, dynamic> map, String id) {
    return AppUser(
      id: id,
      name: map['name'] ?? '',
      email: map['email'] ?? '',
      role: map['role'] ?? 'student',
      classId: map['classId'],
      studentId: map['studentId'],
      phone: map['phone'],
      admissionNo: map['admissionNo'],
      rollNo: map['rollNo'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'email': email,
      'role': role,
      'classId': classId,
      'studentId': studentId,
      'phone': phone,
      'admissionNo': admissionNo,
      'rollNo': rollNo,
    };
  }
}
