class Student {
  final String id;
  final String name;
  final String rollNo;
  final String classId;
  final String admissionNo;
  final String dob;
  final String bloodGroup;
  final String address;
  final String aadhaarNo;
  final String emergencyContact;
  final String parentName;
  final String parentPhone;
  final String parentEmail;
  final String photoUrl;
  final List<String> documents;

  Student({
    required this.id,
    required this.name,
    required this.rollNo,
    required this.classId,
    this.admissionNo = '',
    this.dob = '2010-01-01',
    this.bloodGroup = 'O+',
    this.address = 'Dwarka, New Delhi',
    this.aadhaarNo = '',
    this.emergencyContact = '',
    this.parentName = '',
    this.parentPhone = '',
    this.parentEmail = '',
    this.photoUrl = '',
    this.documents = const [],
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'rollNo': rollNo,
      'classId': classId,
      'admissionNo': admissionNo,
      'dob': dob,
      'bloodGroup': bloodGroup,
      'address': address,
      'aadhaarNo': aadhaarNo,
      'emergencyContact': emergencyContact,
      'parentName': parentName,
      'parentPhone': parentPhone,
      'parentEmail': parentEmail,
      'photoUrl': photoUrl,
      'documents': documents,
    };
  }

  factory Student.fromMap(Map<String, dynamic> map, String documentId) {
    return Student(
      id: documentId,
      name: map['name'] ?? '',
      rollNo: map['rollNo'] ?? '',
      classId: map['classId'] ?? '',
      admissionNo: map['admissionNo'] ?? '',
      dob: map['dob'] ?? '2010-01-01',
      bloodGroup: map['bloodGroup'] ?? 'O+',
      address: map['address'] ?? 'Dwarka, New Delhi',
      aadhaarNo: map['aadhaarNo'] ?? '',
      emergencyContact: map['emergencyContact'] ?? '',
      parentName: map['parentName'] ?? '',
      parentPhone: map['parentPhone'] ?? '',
      parentEmail: map['parentEmail'] ?? '',
      photoUrl: map['photoUrl'] ?? '',
      documents: List<String>.from(map['documents'] ?? []),
    );
  }
}
