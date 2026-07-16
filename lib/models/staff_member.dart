class StaffMember {
  final String id;
  final String name;
  final String email;
  final String role; // 'teacher', 'admin', 'staff'
  final String phone;
  final String designation;
  final String department;
  final String joiningDate;
  final String qualification;
  final String experience;
  final String salary;
  final String aadhaarNo;
  final String panNo;
  final String bankDetails;
  final String photoUrl;
  final List<String> attendanceLogs; // Dates present, e.g. '2026-07-15'
  final List<Map<String, dynamic>> leaves;

  StaffMember({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone = '',
    this.designation = 'Faculty',
    this.department = 'Academics',
    this.joiningDate = '2026-01-15',
    this.qualification = 'B.Ed, Post-Graduation',
    this.experience = '3 Years',
    this.salary = '45000',
    this.aadhaarNo = '',
    this.panNo = '',
    this.bankDetails = 'State Bank of India A/C: 1234567890 IFSC: SBIN0001234',
    this.photoUrl = '',
    this.attendanceLogs = const [],
    this.leaves = const [],
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'phone': phone,
      'designation': designation,
      'department': department,
      'joiningDate': joiningDate,
      'qualification': qualification,
      'experience': experience,
      'salary': salary,
      'aadhaarNo': aadhaarNo,
      'panNo': panNo,
      'bankDetails': bankDetails,
      'photoUrl': photoUrl,
      'attendanceLogs': attendanceLogs,
      'leaves': leaves,
    };
  }

  factory StaffMember.fromMap(Map<String, dynamic> map, String documentId) {
    return StaffMember(
      id: documentId,
      name: map['name'] ?? '',
      email: map['email'] ?? '',
      role: map['role'] ?? 'teacher',
      phone: map['phone'] ?? '',
      designation: map['designation'] ?? 'Faculty',
      department: map['department'] ?? 'Academics',
      joiningDate: map['joiningDate'] ?? '2026-01-15',
      qualification: map['qualification'] ?? 'B.Ed, Post-Graduation',
      experience: map['experience'] ?? '3 Years',
      salary: map['salary'] ?? '45000',
      aadhaarNo: map['aadhaarNo'] ?? '',
      panNo: map['panNo'] ?? '',
      bankDetails: map['bankDetails'] ?? '',
      photoUrl: map['photoUrl'] ?? '',
      attendanceLogs: List<String>.from(map['attendanceLogs'] ?? []),
      leaves: List<Map<String, dynamic>>.from(map['leaves'] ?? []),
    );
  }
}
