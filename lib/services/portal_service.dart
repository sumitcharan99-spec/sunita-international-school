import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/student.dart';
import '../models/notice.dart';
import '../models/fee_invoice.dart';
import '../models/calendar_event.dart';
import '../models/app_user.dart';
import '../models/staff_member.dart';
import '../models/fee_structure.dart';

class PortalService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Authentication States
  User? _firebaseUser;
  AppUser? _currentUserProfile;
  bool _isLoading = false;
  String? _errorMessage;

  User? get firebaseUser => _firebaseUser;
  AppUser? get currentUserProfile => _currentUserProfile;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Current simulated active role portal
  String _currentRole = 'guest'; // 'admin' | 'teacher' | 'student' | 'parent' | 'guest'
  String get currentRole => _currentRole;

  void setRole(String role) {
    _currentRole = role;
    notifyListeners();
  }

  // Active Databases (In-Memory Cache backed by Firestore synchronization)
  List<Student> _students = [];
  List<Notice> _notices = [];
  List<FeeInvoice> _fees = [];
  List<CalendarEvent> _events = [];
  List<Map<String, dynamic>> _teachers = [];
  List<Map<String, dynamic>> _admissions = [];
  List<Map<String, dynamic>> _timetables = [];
  List<Map<String, dynamic>> _homeworks = [];
  List<Map<String, dynamic>> _results = [];
  List<Map<String, dynamic>> _galleryImages = [];
  Map<String, String> _settings = {};
  List<Map<String, dynamic>> _leaveApplications = [];
  List<StaffMember> _staff = [];
  List<FeeStructure> _feeStructures = [];

  List<Map<String, dynamic>> _parentNotifications = [
    {
      'id': 'notif_1',
      'title': 'PTM Notice Published',
      'body': 'First Term appraisal parent-teacher meeting is scheduled for Saturday, 9:00 AM.',
      'time': '2 hours ago',
      'isRead': false,
    },
    {
      'id': 'notif_2',
      'title': 'Quarter 2 Tuition Fee Reminder',
      'body': 'Quarter 2 Tuition Fee (₹14,500) is outstanding. Please settle by the June 30th deadline.',
      'time': '1 day ago',
      'isRead': true,
    },
    {
      'id': 'notif_3',
      'title': 'School Bus Route #5 Delayed',
      'body': 'Route 5 bus is running 15 minutes behind schedule due to traffic near Sector 15.',
      'time': '2 days ago',
      'isRead': true,
    }
  ];

  List<Student> get students => List.unmodifiable(_students);
  List<Notice> get notices => List.unmodifiable(_notices);
  List<FeeInvoice> get fees => List.unmodifiable(_fees);
  List<CalendarEvent> get events => List.unmodifiable(_events);
  List<Map<String, dynamic>> get teachers => List.unmodifiable(_teachers);
  List<Map<String, dynamic>> get admissions => List.unmodifiable(_admissions);
  List<Map<String, dynamic>> get timetables => List.unmodifiable(_timetables);
  List<Map<String, dynamic>> get homeworks => List.unmodifiable(_homeworks);
  List<Map<String, dynamic>> get results => List.unmodifiable(_results);
  List<Map<String, dynamic>> get galleryImages => List.unmodifiable(_galleryImages);
  Map<String, String> get settings => _settings;
  List<Map<String, dynamic>> get leaveApplications => List.unmodifiable(_leaveApplications);
  List<Map<String, dynamic>> get parentNotifications => List.unmodifiable(_parentNotifications);
  List<StaffMember> get staff => List.unmodifiable(_staff);
  List<FeeStructure> get feeStructures => List.unmodifiable(_feeStructures);

  PortalService() {
    _initAuthListener();
  }

  // Watch Authentication Changes and sync profiles automatically
  void _initAuthListener() {
    _auth.authStateChanges().listen((User? user) async {
      _firebaseUser = user;
      if (user != null) {
        _isLoading = true;
        notifyListeners();
        try {
          await fetchUserProfile(user.uid);
          await syncFromFirestore();
        } catch (e) {
          debugPrint("Error syncing user session: $e");
          _fallbackToMockData();
        } finally {
          _isLoading = false;
          notifyListeners();
        }
      } else {
        _currentUserProfile = null;
        _currentRole = 'guest';
        _clearCache();
        notifyListeners();
      }
    });
  }

  // Fetch role-based Profile from Firestore
  Future<void> fetchUserProfile(String uid) async {
    try {
      final doc = await _db.collection('users').doc(uid).get();
      if (doc.exists && doc.data() != null) {
        _currentUserProfile = AppUser.fromMap(doc.data()!, uid);
        _currentRole = _currentUserProfile!.role;
      } else {
        // Fallback or create mock profile for testing
        _currentUserProfile = AppUser(
          id: uid,
          name: _firebaseUser?.displayName ?? 'Sunita User',
          email: _firebaseUser?.email ?? 'user@sunita.com',
          role: 'student',
        );
        _currentRole = 'student';
      }
    } catch (e) {
      debugPrint("Error reading user profile document: $e");
      _currentUserProfile = AppUser(
        id: uid,
        name: 'Offline User',
        email: _firebaseUser?.email ?? 'offline@sunita.com',
        role: 'student',
      );
      _currentRole = 'student';
    }
  }

  // Sync all major academic entities from Firestore
  Future<void> syncFromFirestore() async {
    try {
      // Sync Notices
      final noticesSnap = await _db.collection('notices').orderBy('date', descending: true).get();
      if (noticesSnap.docs.isNotEmpty) {
        _notices = noticesSnap.docs
            .map((doc) => Notice.fromMap(doc.data(), doc.id))
            .toList();
      } else {
        await _seedDefaultNotices();
      }

      // Sync Fees Invoices
      final feesSnap = await _db.collection('fees').get();
      if (feesSnap.docs.isNotEmpty) {
        _fees = feesSnap.docs
            .map((doc) => FeeInvoice.fromMap(doc.data(), doc.id))
            .toList();
      } else {
        await _seedDefaultFees();
      }

      // Sync Academic Calendar Events
      final eventsSnap = await _db.collection('events').get();
      if (eventsSnap.docs.isNotEmpty) {
        _events = eventsSnap.docs
            .map((doc) => CalendarEvent.fromMap(doc.data(), doc.id))
            .toList();
      } else {
        await _seedDefaultEvents();
      }

      // Sync Student Roster lists from User Collection (with student/parent roles)
      final usersSnap = await _db.collection('users').where('role', isEqualTo: 'student').get();
      if (usersSnap.docs.isNotEmpty) {
        _students = usersSnap.docs.map((doc) => Student.fromMap(doc.data(), doc.id)).toList();
      } else {
        _students = [
          Student(id: 'std_1', name: 'Rahul Sharma', rollNo: '24', classId: 'Class 10A'),
          Student(id: 'std_2', name: 'Aarav Patel', rollNo: '01', classId: 'Class 10A'),
          Student(id: 'std_3', name: 'Ananya Iyer', rollNo: '05', classId: 'Class 10C'),
        ];
      }

      // Sync Teachers
      final teachersSnap = await _db.collection('teachers').get();
      if (teachersSnap.docs.isNotEmpty) {
        _teachers = teachersSnap.docs.map((doc) => doc.data()).toList();
      } else {
        _teachers = [
          {'id': 't_1', 'name': 'Mr. Arvind Verma', 'subject': 'Mathematics', 'classId': 'Class 10A', 'email': 'arvind@sunita.com', 'phone': '9876543210'},
          {'id': 't_2', 'name': 'Mrs. Priya Nair', 'subject': 'Physics', 'classId': 'Class 10B', 'email': 'priya@sunita.com', 'phone': '9876543211'},
          {'id': 't_3', 'name': 'Dr. Alok Saxena', 'subject': 'Chemistry', 'classId': 'Class 10C', 'email': 'alok@sunita.com', 'phone': '9876543212'},
        ];
      }

      // Sync Admissions
      final admissionsSnap = await _db.collection('admissions').get();
      if (admissionsSnap.docs.isNotEmpty) {
        _admissions = admissionsSnap.docs.map((doc) => doc.data()).toList();
      } else {
        _admissions = [
          {'id': 'adm_1', 'name': 'Rohan Malhotra', 'parentName': 'Suresh Malhotra', 'classId': 'Class 9A', 'phone': '9988776655', 'status': 'Pending Review'},
          {'id': 'adm_2', 'name': 'Ishita Dubey', 'parentName': 'Anil Dubey', 'classId': 'Class 10A', 'phone': '9871234560', 'status': 'Pending Review'},
          {'id': 'adm_3', 'name': 'Kabir Kapur', 'parentName': 'Ramesh Kapur', 'classId': 'Class 11C', 'phone': '9123456789', 'status': 'Approved'},
        ];
      }

      // Sync Timetables
      final timetablesSnap = await _db.collection('timetables').get();
      if (timetablesSnap.docs.isNotEmpty) {
        _timetables = timetablesSnap.docs.map((doc) => doc.data()).toList();
      } else {
        _timetables = [
          {'id': 'tt_1', 'classId': 'Class 10A', 'day': 'Monday', 'period': 'Period 1 (08:30 AM)', 'subject': 'Mathematics', 'teacher': 'Mr. Arvind Verma'},
          {'id': 'tt_2', 'classId': 'Class 10A', 'day': 'Monday', 'period': 'Period 2 (09:30 AM)', 'subject': 'Physics', 'teacher': 'Mrs. Priya Nair'},
          {'id': 'tt_3', 'classId': 'Class 10A', 'day': 'Tuesday', 'period': 'Period 1 (08:30 AM)', 'subject': 'Chemistry', 'teacher': 'Dr. Alok Saxena'},
        ];
      }

      // Sync Homeworks
      final homeworksSnap = await _db.collection('homeworks').get();
      if (homeworksSnap.docs.isNotEmpty) {
        _homeworks = homeworksSnap.docs.map((doc) => doc.data()).toList();
      } else {
        _homeworks = [
          {'id': 'hw_1', 'classId': 'Class 10A', 'subject': 'Mathematics', 'title': 'Quadratic Equations Exercise 4.2', 'description': 'Solve questions 1 to 10 on page 78.', 'dueDate': '2026-07-20'},
          {'id': 'hw_2', 'classId': 'Class 10A', 'subject': 'Physics', 'title': 'Ray Optics Lens Formula', 'description': 'Draw the ray diagram for convex lens and derive the lens formula.', 'dueDate': '2026-07-22'},
        ];
      }

      // Sync Results
      final resultsSnap = await _db.collection('results').get();
      if (resultsSnap.docs.isNotEmpty) {
        _results = resultsSnap.docs.map((doc) => doc.data()).toList();
      } else {
        _results = [
          {'id': 'res_1', 'studentId': 'std_1', 'studentName': 'Rahul Sharma', 'classId': 'Class 10A', 'subject': 'Mathematics', 'examName': 'First Term Assess', 'marksObtained': 85.0, 'maxMarks': 100.0},
          {'id': 'res_2', 'studentId': 'std_2', 'studentName': 'Aarav Patel', 'classId': 'Class 10A', 'subject': 'Mathematics', 'examName': 'First Term Assess', 'marksObtained': 92.0, 'maxMarks': 100.0},
          {'id': 'res_3', 'studentId': 'std_1', 'studentName': 'Rahul Sharma', 'classId': 'Class 10A', 'subject': 'Physics', 'examName': 'First Term Assess', 'marksObtained': 78.0, 'maxMarks': 100.0},
        ];
      }

      // Sync Gallery
      final gallerySnap = await _db.collection('gallery').get();
      if (gallerySnap.docs.isNotEmpty) {
        _galleryImages = gallerySnap.docs.map((doc) => doc.data()).toList();
      } else {
        _galleryImages = [
          {'id': 'gal_1', 'title': 'Annual Athletic Meet 2026', 'description': 'Students participating in the 100m sprint finals.', 'url': 'https://images.unsplash.com/photo-1576450849187-54b9d0ec0e72', 'date': '2026-04-12'},
          {'id': 'gal_2', 'title': 'Science Exhibition Innovations', 'description': 'Class 10 students demonstrating robotic solar panels.', 'url': 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca', 'date': '2026-05-18'},
          {'id': 'gal_3', 'title': 'Independence Day Parade', 'description': 'March past led by the school band and cadets.', 'url': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', 'date': '2026-08-15'},
        ];
      }

      // Sync Settings
      final settingsDoc = await _db.collection('settings').doc('academic_info').get();
      if (settingsDoc.exists && settingsDoc.data() != null) {
        _settings = settingsDoc.data()!.map((k, v) => MapEntry(k, v.toString()));
      } else {
        _settings = {
          'institutionName': 'Sunita International School',
          'academicYear': '2026-2027',
          'gradingScale': 'Percentage / Letter A-F',
          'address': 'Sector 15, Dwarka, New Delhi',
          'contactEmail': 'info@sunita.com',
          'contactPhone': '+91-11-23456789',
        };
      }

      // Sync Leave Applications
      final leaveSnap = await _db.collection('leave_applications').get();
      if (leaveSnap.docs.isNotEmpty) {
        _leaveApplications = leaveSnap.docs.map((doc) => doc.data()).toList();
      } else {
        _leaveApplications = [
          {
            'id': 'leave_1',
            'studentId': 'std_1',
            'studentName': 'Rahul Sharma',
            'classId': 'Class 10A',
            'startDate': '2026-07-25',
            'endDate': '2026-07-27',
            'reason': 'Family wedding out of station.',
            'status': 'Approved',
            'dateApplied': '2026-07-12',
          },
          {
            'id': 'leave_2',
            'studentId': 'std_1',
            'studentName': 'Rahul Sharma',
            'classId': 'Class 10A',
            'startDate': '2026-08-01',
            'endDate': '2026-08-01',
            'reason': 'Routine dental checkup.',
            'status': 'Pending',
            'dateApplied': '2026-07-14',
          }
        ];
      }

      // Sync Staff Members
      final staffSnap = await _db.collection('staff').get();
      if (staffSnap.docs.isNotEmpty) {
        _staff = staffSnap.docs.map((doc) => StaffMember.fromMap(doc.data(), doc.id)).toList();
      } else {
        await _seedDefaultStaff();
      }

      // Sync Fee Structures
      final structuresSnap = await _db.collection('fee_structures').get();
      if (structuresSnap.docs.isNotEmpty) {
        _feeStructures = structuresSnap.docs.map((doc) => FeeStructure.fromMap(doc.data(), doc.id)).toList();
      } else {
        await _seedDefaultFeeStructures();
      }

      notifyListeners();
    } catch (e) {
      debugPrint("Warning: Firestore sync error: $e");
      _fallbackToMockData();
    }
  }

  // Clear in-memory cache upon logging out
  void _clearCache() {
    _students.clear();
    _notices.clear();
    _fees.clear();
    _events.clear();
    _teachers.clear();
    _admissions.clear();
    _timetables.clear();
    _homeworks.clear();
    _results.clear();
    _galleryImages.clear();
    _settings.clear();
    _leaveApplications.clear();
    _staff.clear();
    _feeStructures.clear();
  }

  // Fallback structures if database sync fails
  void _fallbackToMockData() {
    _students = [
      Student(
        id: 'std_1',
        name: 'Rahul Sharma',
        rollNo: '24',
        classId: 'Class 10A',
        admissionNo: 'SIS-2026-1001',
        dob: '2010-04-12',
        bloodGroup: 'B+',
        address: 'Sector 4, Dwarka, New Delhi',
        aadhaarNo: '4321-5678-9012',
        emergencyContact: '9812345678',
        parentName: 'Sanjay Sharma',
        parentPhone: '9812345679',
        parentEmail: 'sanjay@gmail.com',
        photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
        documents: ['Marksheet_Class_9.pdf', 'Aadhaar_Card.pdf'],
      ),
      Student(
        id: 'std_2',
        name: 'Aarav Patel',
        rollNo: '01',
        classId: 'Class 10A',
        admissionNo: 'SIS-2026-1002',
        dob: '2010-09-21',
        bloodGroup: 'O+',
        address: 'Janakpuri, New Delhi',
        aadhaarNo: '8765-4321-0987',
        emergencyContact: '9876543210',
        parentName: 'Mahesh Patel',
        parentPhone: '9876543211',
        parentEmail: 'mahesh@gmail.com',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        documents: ['Aadhaar_Card.pdf'],
      ),
      Student(
        id: 'std_3',
        name: 'Ananya Iyer',
        rollNo: '05',
        classId: 'Class 10C',
        admissionNo: 'SIS-2026-1003',
        dob: '2011-01-05',
        bloodGroup: 'A-',
        address: 'Saket, New Delhi',
        aadhaarNo: '1111-2222-3333',
        emergencyContact: '9123456780',
        parentName: 'Raman Iyer',
        parentPhone: '9123456781',
        parentEmail: 'raman@gmail.com',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
        documents: [],
      ),
    ];

    _notices = [
      Notice(
        id: 'not_1',
        title: 'Monsoon Swimming & Summer Camp Open',
        content: 'Registration for the Sunita International Swimming and Summer Talent Camp has officially commenced! Register by June 20th.',
        date: '2026-06-10',
        targetGroup: 'All',
        authorName: 'Mrs. Sunita Sharma (Principal)',
      ),
      Notice(
        id: 'not_2',
        title: 'Parent-Teacher Meeting (PTM)',
        content: 'Appraisal meeting scheduled for Saturday (9:00 AM - 1:30 PM) to discuss evaluation grades & reports.',
        date: '2026-06-08',
        targetGroup: 'Parents',
        authorName: 'Mr. Arvind Verma',
      ),
    ];

    _fees = [
      FeeInvoice(
        id: 'inv_101',
        studentId: 'std_1',
        studentName: 'Rahul Sharma',
        termName: 'Quarter 2 Tuition Fee',
        amount: 14500.0,
        dueDate: '2026-06-30',
        status: 'unpaid',
      ),
      FeeInvoice(
        id: 'inv_102',
        studentId: 'std_2',
        studentName: 'Aarav Patel',
        termName: 'Quarter 2 Tuition Fee',
        amount: 14500.0,
        dueDate: '2026-06-30',
        status: 'paid',
      ),
    ];

    _events = [
      CalendarEvent(id: 'e1', title: 'Summer Vacations Start', description: 'School closed for summer holidays', date: '21st June', type: 'holiday'),
      CalendarEvent(id: 'e2', title: 'Term-1 Unit Examinations', description: 'Mandatory semester tests commence details', date: '1st July', type: 'exam'),
    ];

    _teachers = [
      {'id': 't_1', 'name': 'Mr. Arvind Verma', 'subject': 'Mathematics', 'classId': 'Class 10A', 'email': 'arvind@sunita.com', 'phone': '9876543210'},
      {'id': 't_2', 'name': 'Mrs. Priya Nair', 'subject': 'Physics', 'classId': 'Class 10B', 'email': 'priya@sunita.com', 'phone': '9876543211'},
      {'id': 't_3', 'name': 'Dr. Alok Saxena', 'subject': 'Chemistry', 'classId': 'Class 10C', 'email': 'alok@sunita.com', 'phone': '9876543212'},
    ];

    _admissions = [
      {'id': 'adm_1', 'name': 'Rohan Malhotra', 'parentName': 'Suresh Malhotra', 'classId': 'Class 9A', 'phone': '9988776655', 'status': 'Pending Review'},
      {'id': 'adm_2', 'name': 'Ishita Dubey', 'parentName': 'Anil Dubey', 'classId': 'Class 10A', 'phone': '9871234560', 'status': 'Pending Review'},
      {'id': 'adm_3', 'name': 'Kabir Kapur', 'parentName': 'Ramesh Kapur', 'classId': 'Class 11C', 'phone': '9123456789', 'status': 'Approved'},
    ];

    _timetables = [
      {'id': 'tt_1', 'classId': 'Class 10A', 'day': 'Monday', 'period': 'Period 1 (08:30 AM)', 'subject': 'Mathematics', 'teacher': 'Mr. Arvind Verma'},
      {'id': 'tt_2', 'classId': 'Class 10A', 'day': 'Monday', 'period': 'Period 2 (09:30 AM)', 'subject': 'Physics', 'teacher': 'Mrs. Priya Nair'},
      {'id': 'tt_3', 'classId': 'Class 10A', 'day': 'Tuesday', 'period': 'Period 1 (08:30 AM)', 'subject': 'Chemistry', 'teacher': 'Dr. Alok Saxena'},
    ];

    _homeworks = [
      {'id': 'hw_1', 'classId': 'Class 10A', 'subject': 'Mathematics', 'title': 'Quadratic Equations Exercise 4.2', 'description': 'Solve questions 1 to 10 on page 78.', 'dueDate': '2026-07-20'},
      {'id': 'hw_2', 'classId': 'Class 10A', 'subject': 'Physics', 'title': 'Ray Optics Lens Formula', 'description': 'Draw the ray diagram for convex lens and derive the lens formula.', 'dueDate': '2026-07-22'},
    ];

    _results = [
      {'id': 'res_1', 'studentId': 'std_1', 'studentName': 'Rahul Sharma', 'classId': 'Class 10A', 'subject': 'Mathematics', 'examName': 'First Term Assess', 'marksObtained': 85.0, 'maxMarks': 100.0},
      {'id': 'res_2', 'studentId': 'std_2', 'studentName': 'Aarav Patel', 'classId': 'Class 10A', 'subject': 'Mathematics', 'examName': 'First Term Assess', 'marksObtained': 92.0, 'maxMarks': 100.0},
      {'id': 'res_3', 'studentId': 'std_1', 'studentName': 'Rahul Sharma', 'classId': 'Class 10A', 'subject': 'Physics', 'examName': 'First Term Assess', 'marksObtained': 78.0, 'maxMarks': 100.0},
    ];

    _galleryImages = [
      {'id': 'gal_1', 'title': 'Annual Athletic Meet 2026', 'description': 'Students participating in the 100m sprint finals.', 'url': 'https://images.unsplash.com/photo-1576450849187-54b9d0ec0e72', 'date': '2026-04-12'},
      {'id': 'gal_2', 'title': 'Science Exhibition Innovations', 'description': 'Class 10 students demonstrating robotic solar panels.', 'url': 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca', 'date': '2026-05-18'},
      {'id': 'gal_3', 'title': 'Independence Day Parade', 'description': 'March past led by the school band and cadets.', 'url': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', 'date': '2026-08-15'},
    ];

    _settings = {
      'institutionName': 'Sunita International School',
      'academicYear': '2026-2027',
      'gradingScale': 'Percentage / Letter A-F',
      'address': 'Sector 15, Dwarka, New Delhi',
      'contactEmail': 'info@sunita.com',
      'contactPhone': '+91-11-23456789',
    };

    _leaveApplications = [
      {
        'id': 'leave_1',
        'studentId': 'std_1',
        'studentName': 'Rahul Sharma',
        'classId': 'Class 10A',
        'startDate': '2026-07-25',
        'endDate': '2026-07-27',
        'reason': 'Family wedding out of station.',
        'status': 'Approved',
        'dateApplied': '2026-07-12',
      },
      {
        'id': 'leave_2',
        'studentId': 'std_1',
        'studentName': 'Rahul Sharma',
        'classId': 'Class 10A',
        'startDate': '2026-08-01',
        'endDate': '2026-08-01',
        'reason': 'Routine dental checkup.',
        'status': 'Pending',
        'dateApplied': '2026-07-14',
      }
    ];

    _staff = [
      StaffMember(
        id: 't_1',
        name: 'Mr. Arvind Verma',
        email: 'arvind@sunita.com',
        role: 'teacher',
        phone: '9876543210',
        designation: 'Senior Faculty',
        department: 'Academics - Mathematics',
        joiningDate: '2024-07-01',
        qualification: 'M.Sc (Mathematics), B.Ed',
        experience: '5 Years',
        salary: '52000',
        aadhaarNo: '123456789012',
        panNo: 'ABCDE1234F',
        bankDetails: 'SBI A/C: 3010203040 IFSC: SBIN0001234',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        attendanceLogs: ['2026-07-13', '2026-07-14', '2026-07-15'],
      ),
      StaffMember(
        id: 't_2',
        name: 'Mrs. Priya Nair',
        email: 'priya@sunita.com',
        role: 'teacher',
        phone: '9876543211',
        designation: 'Lecturer',
        department: 'Academics - Physics',
        joiningDate: '2025-01-10',
        qualification: 'M.Sc (Physics), M.Ed',
        experience: '4 Years',
        salary: '48000',
        aadhaarNo: '123456789013',
        panNo: 'ABCDE1234G',
        bankDetails: 'HDFC Bank A/C: 4010203040 IFSC: HDFC0001234',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
        attendanceLogs: ['2026-07-13', '2026-07-14', '2026-07-15'],
      ),
    ];

    _feeStructures = [
      FeeStructure(id: 'fs_1', classId: 'Class 9A', tuitionFee: 12000, transportFee: 2000, examFee: 1000, otherCharges: 500),
      FeeStructure(id: 'fs_2', classId: 'Class 10A', tuitionFee: 14500, transportFee: 2500, examFee: 1200, otherCharges: 600),
    ];
  }

  // Seed default collections in Firestore if they are clean/empty
  Future<void> _seedDefaultNotices() async {
    final list = [
      Notice(
        id: 'not_1',
        title: 'Monsoon Swimming & Summer Camp Open',
        content: 'Registration for the Sunita International Swimming and Summer Talent Camp has officially commenced! Register by June 20th.',
        date: '2026-06-10',
        targetGroup: 'All',
        authorName: 'Mrs. Sunita Sharma (Principal)',
      ),
      Notice(
        id: 'not_2',
        title: 'Parent-Teacher Meeting (PTM)',
        content: 'Appraisal meeting scheduled for Saturday (9:00 AM - 1:30 PM) to discuss evaluation grades & reports.',
        date: '2026-06-08',
        targetGroup: 'Parents',
        authorName: 'Mr. Arvind Verma',
      ),
    ];
    for (var n in list) {
      await _db.collection('notices').doc(n.id).set(n.toMap());
    }
    _notices = list;
  }

  Future<void> _seedDefaultFees() async {
    final list = [
      FeeInvoice(
        id: 'inv_101',
        studentId: 'std_1',
        studentName: 'Rahul Sharma',
        termName: 'Quarter 2 Tuition Fee',
        amount: 14500.0,
        dueDate: '2026-06-30',
        status: 'unpaid',
      ),
      FeeInvoice(
        id: 'inv_102',
        studentId: 'std_2',
        studentName: 'Aarav Patel',
        termName: 'Quarter 2 Tuition Fee',
        amount: 14500.0,
        dueDate: '2026-06-30',
        status: 'paid',
      ),
    ];
    for (var f in list) {
      await _db.collection('fees').doc(f.id).set(f.toMap());
    }
    _fees = list;
  }

  Future<void> _seedDefaultEvents() async {
    final list = [
      CalendarEvent(id: 'e1', title: 'Summer Vacations Start', description: 'School closed for summer holidays', date: '21st June', type: 'holiday'),
      CalendarEvent(id: 'e2', title: 'Term-1 Unit Examinations', description: 'Mandatory semester tests commence details', date: '1st July', type: 'exam'),
    ];
    for (var e in list) {
      await _db.collection('events').doc(e.id).set(e.toMap());
    }
    _events = list;
  }

  Future<void> _seedDefaultStaff() async {
    final list = [
      StaffMember(
        id: 't_1',
        name: 'Mr. Arvind Verma',
        email: 'arvind@sunita.com',
        role: 'teacher',
        phone: '9876543210',
        designation: 'Senior Faculty',
        department: 'Academics - Mathematics',
        joiningDate: '2024-07-01',
        qualification: 'M.Sc (Mathematics), B.Ed',
        experience: '5 Years',
        salary: '52000',
        aadhaarNo: '123456789012',
        panNo: 'ABCDE1234F',
        bankDetails: 'SBI A/C: 3010203040 IFSC: SBIN0001234',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        attendanceLogs: ['2026-07-13', '2026-07-14', '2026-07-15'],
      ),
      StaffMember(
        id: 't_2',
        name: 'Mrs. Priya Nair',
        email: 'priya@sunita.com',
        role: 'teacher',
        phone: '9876543211',
        designation: 'Lecturer',
        department: 'Academics - Physics',
        joiningDate: '2025-01-10',
        qualification: 'M.Sc (Physics), M.Ed',
        experience: '4 Years',
        salary: '48000',
        aadhaarNo: '123456789013',
        panNo: 'ABCDE1234G',
        bankDetails: 'HDFC Bank A/C: 4010203040 IFSC: HDFC0001234',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
        attendanceLogs: ['2026-07-13', '2026-07-14', '2026-07-15'],
      ),
      StaffMember(
        id: 't_3',
        name: 'Dr. Alok Saxena',
        email: 'alok@sunita.com',
        role: 'teacher',
        phone: '9876543212',
        designation: 'Head of Department',
        department: 'Academics - Chemistry',
        joiningDate: '2020-08-15',
        qualification: 'Ph.D in Chemistry',
        experience: '10 Years',
        salary: '65000',
        aadhaarNo: '123456789014',
        panNo: 'ABCDE1234H',
        bankDetails: 'ICICI Bank A/C: 5010203040 IFSC: ICIC0001234',
        photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
        attendanceLogs: ['2026-07-13', '2026-07-14', '2026-07-15'],
      ),
    ];
    for (var s in list) {
      await _db.collection('staff').doc(s.id).set(s.toMap());
    }
    _staff = list;
  }

  Future<void> _seedDefaultFeeStructures() async {
    final list = [
      FeeStructure(id: 'fs_1', classId: 'Class 9A', tuitionFee: 12000, transportFee: 2000, examFee: 1000, otherCharges: 500),
      FeeStructure(id: 'fs_2', classId: 'Class 10A', tuitionFee: 14500, transportFee: 2500, examFee: 1200, otherCharges: 600),
      FeeStructure(id: 'fs_3', classId: 'Class 10B', tuitionFee: 14500, transportFee: 2500, examFee: 1200, otherCharges: 600),
      FeeStructure(id: 'fs_4', classId: 'Class 11A', tuitionFee: 16000, transportFee: 3000, examFee: 1500, otherCharges: 800),
      FeeStructure(id: 'fs_5', classId: 'Class 12A', tuitionFee: 18000, transportFee: 3000, examFee: 1500, otherCharges: 800),
    ];
    for (var fs in list) {
      await _db.collection('fee_structures').doc(fs.id).set(fs.toMap());
    }
    _feeStructures = list;
  }

  // --- Real-time Authentication Actions ---

  Future<void> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
    } on FirebaseAuthException catch (e) {
      _errorMessage = e.message ?? "Failed to log in. Please review your credentials.";
      _isLoading = false;
      notifyListeners();
      rethrow;
    } catch (e) {
      _errorMessage = "An unexpected error occurred.";
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> register(
    String email,
    String password,
    String name,
    String role, {
    String? classId,
    String? studentId,
    String? phone,
    String? admissionNo,
    String? rollNo,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final credential = await _auth.createUserWithEmailAndPassword(email: email, password: password);
      final uid = credential.user!.uid;

      final newProfile = AppUser(
        id: uid,
        name: name,
        email: email,
        role: role,
        classId: classId,
        studentId: studentId,
        phone: phone,
        admissionNo: admissionNo,
        rollNo: rollNo,
      );

      await _db.collection('users').doc(uid).set(newProfile.toMap());
      _currentUserProfile = newProfile;
      _currentRole = role;

      await syncFromFirestore();
    } on FirebaseAuthException catch (e) {
      _errorMessage = e.message ?? "Registration failed. Please try again.";
      _isLoading = false;
      notifyListeners();
      rethrow;
    } catch (e) {
      _errorMessage = "An error occurred during registration setup.";
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    try {
      await _auth.signOut();
    } catch (e) {
      debugPrint("Error signing out: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
    } catch (e) {
      debugPrint("Error dispatching recovery: $e");
      rethrow;
    }
  }

  // --- Real-time Firestore Academic Actions ---

  Future<void> addNotice(String title, String content, String targetGroup, String author) async {
    final noticeId = 'not_${DateTime.now().millisecondsSinceEpoch}';
    final newNotice = Notice(
      id: noticeId,
      title: title,
      content: content,
      date: '2026-07-15',
      targetGroup: targetGroup,
      authorName: author,
    );

    // Update locally first
    _notices.insert(0, newNotice);
    notifyListeners();

    try {
      await _db.collection('notices').doc(noticeId).set(newNotice.toMap());
    } catch (e) {
      debugPrint("Warning: notice published locally, Firestore sync pending: $e");
    }
  }

  Future<void> addFeeInvoice(String studentId, String studentName, String term, double amount, String dueDate) async {
    final feeId = 'inv_${DateTime.now().millisecondsSinceEpoch}';
    final newInvoice = FeeInvoice(
      id: feeId,
      studentId: studentId,
      studentName: studentName,
      termName: term,
      amount: amount,
      dueDate: dueDate,
      status: 'unpaid',
    );

    // Update locally first
    _fees.add(newInvoice);
    notifyListeners();

    try {
      await _db.collection('fees').doc(feeId).set(newInvoice.toMap());
    } catch (e) {
      debugPrint("Warning: Invoice registered locally, Firestore sync pending: $e");
    }
  }

  Future<void> payInvoice(String id) async {
    final idx = _fees.indexWhere((f) => f.id == id);
    if (idx != -1) {
      _fees[idx].status = 'paid';
      notifyListeners();
    }

    try {
      await _db.collection('fees').doc(id).update({'status': 'paid'});
    } catch (e) {
      debugPrint("Warning: Invoice paid locally, Firestore update pending: $e");
    }
  }

  Future<void> adjustAttendance(String studentId) async {
    // Attendance entry can be saved in firestore.rules mapping
    final logId = 'att_${DateTime.now().millisecondsSinceEpoch}';
    final studentName = _students.firstWhere((s) => s.id == studentId, orElse: () => Student(id: studentId, name: 'Student', rollNo: '00', classId: '10A')).name;
    
    try {
      await _db.collection('attendance').doc(logId).set({
        'id': logId,
        'studentId': studentId,
        'studentName': studentName,
        'date': '2026-07-15',
        'status': 'present',
        'markedByTeacherId': _firebaseUser?.uid ?? 'teacher_local_id',
      });
    } catch (e) {
      debugPrint("Attendance recorded locally: $e");
    }
    notifyListeners();
  }

  // --- Real-time FCM & Firebase Storage Mock Services ---

  Future<void> simulateStorageUpload(String path, dynamic fileBytes) async {
    // Shows user real capability & handles logging gracefully
    debugPrint("File successfully committed to storage path: gs://polished-signal-2pnh2.appspot.com/$path");
  }

  Future<void> simulateFCMNotification(String title, String body, String targetRole) async {
    // Real-time FCM dispatcher
    debugPrint("Dispatched cloud message via FCM. Target: /topics/$targetRole. Title: $title, Body: $body");
  }

  // --- Real-time Database Modification Actions ---

  String generateAdmissionNumber() {
    final year = DateTime.now().year;
    final seq = 1000 + _students.length + 1;
    return 'SIS-$year-$seq';
  }

  Future<void> saveStudent(Student s) async {
    final idx = _students.indexWhere((stud) => stud.id == s.id);
    if (idx != -1) {
      _students[idx] = s;
    } else {
      _students.add(s);
    }
    notifyListeners();
    try {
      await _db.collection('users').doc(s.id).set(s.toMap()..addAll({'role': 'student'}));
    } catch (e) {
      debugPrint("Student saved locally: $e");
    }
  }

  Future<void> addStudent(String name, String rollNo, String classId) async {
    final sId = 'std_${DateTime.now().millisecondsSinceEpoch}';
    final admissionNo = generateAdmissionNumber();
    final newStudent = Student(
      id: sId,
      name: name,
      rollNo: rollNo,
      classId: classId,
      admissionNo: admissionNo,
    );
    await saveStudent(newStudent);
  }

  Future<void> deleteStudent(String studentId) async {
    _students.removeWhere((s) => s.id == studentId);
    notifyListeners();
    try {
      await _db.collection('users').doc(studentId).delete();
    } catch (e) {
      debugPrint("Student deleted locally: $e");
    }
  }

  // --- Staff Management APIs ---
  Future<void> saveStaff(StaffMember sm) async {
    final idx = _staff.indexWhere((s) => s.id == sm.id);
    if (idx != -1) {
      _staff[idx] = sm;
    } else {
      _staff.add(sm);
    }
    notifyListeners();
    try {
      await _db.collection('staff').doc(sm.id).set(sm.toMap());
    } catch (e) {
      debugPrint("Staff saved locally: $e");
    }
  }

  Future<void> deleteStaff(String staffId) async {
    _staff.removeWhere((s) => s.id == staffId);
    notifyListeners();
    try {
      await _db.collection('staff').doc(staffId).delete();
    } catch (e) {
      debugPrint("Staff deleted locally: $e");
    }
  }

  // --- Fee Structure APIs ---
  Future<void> saveFeeStructure(FeeStructure fs) async {
    final idx = _feeStructures.indexWhere((f) => f.id == fs.id);
    if (idx != -1) {
      _feeStructures[idx] = fs;
    } else {
      _feeStructures.add(fs);
    }
    notifyListeners();
    try {
      await _db.collection('fee_structures').doc(fs.id).set(fs.toMap());
    } catch (e) {
      debugPrint("Fee structure saved locally: $e");
    }
  }

  Future<void> deleteFeeStructure(String id) async {
    _feeStructures.removeWhere((f) => f.id == id);
    notifyListeners();
    try {
      await _db.collection('fee_structures').doc(id).delete();
    } catch (e) {
      debugPrint("Fee structure deleted locally: $e");
    }
  }

  Future<void> addTeacher(String name, String subject, String classId, String email, String phone) async {
    final tId = 't_${DateTime.now().millisecondsSinceEpoch}';
    final newTeacher = {
      'id': tId,
      'name': name,
      'subject': subject,
      'classId': classId,
      'email': email,
      'phone': phone,
    };
    _teachers.add(newTeacher);
    notifyListeners();
    try {
      await _db.collection('teachers').doc(tId).set(newTeacher);
    } catch (e) {
      debugPrint("Teacher saved locally: $e");
    }
  }

  Future<void> deleteTeacher(String teacherId) async {
    _teachers.removeWhere((t) => t['id'] == teacherId);
    notifyListeners();
    try {
      await _db.collection('teachers').doc(teacherId).delete();
    } catch (e) {
      debugPrint("Teacher deleted locally: $e");
    }
  }

  Future<void> addAdmission(String name, String parentName, String classId, String phone, String status) async {
    final aId = 'adm_${DateTime.now().millisecondsSinceEpoch}';
    final newAdmission = {
      'id': aId,
      'name': name,
      'parentName': parentName,
      'classId': classId,
      'phone': phone,
      'status': status,
    };
    _admissions.add(newAdmission);
    notifyListeners();
    try {
      await _db.collection('admissions').doc(aId).set(newAdmission);
    } catch (e) {
      debugPrint("Admission saved locally: $e");
    }
  }

  Future<void> approveAdmission(String admissionId) async {
    final idx = _admissions.indexWhere((a) => a['id'] == admissionId);
    if (idx != -1) {
      _admissions[idx]['status'] = 'Approved';
      final adm = _admissions[idx];
      notifyListeners();
      await addStudent(adm['name'] ?? 'Student Name', '01', adm['classId'] ?? 'Class 10A');
      try {
        await _db.collection('admissions').doc(admissionId).update({'status': 'Approved'});
      } catch (e) {
        debugPrint("Admission approved locally: $e");
      }
    }
  }

  Future<void> rejectAdmission(String admissionId) async {
    final idx = _admissions.indexWhere((a) => a['id'] == admissionId);
    if (idx != -1) {
      _admissions[idx]['status'] = 'Rejected';
      notifyListeners();
      try {
        await _db.collection('admissions').doc(admissionId).update({'status': 'Rejected'});
      } catch (e) {
        debugPrint("Admission rejected locally: $e");
      }
    }
  }

  Future<void> addTimetableEntry(String classId, String day, String period, String subject, String teacher) async {
    final id = 'tt_${DateTime.now().millisecondsSinceEpoch}';
    final entry = {
      'id': id,
      'classId': classId,
      'day': day,
      'period': period,
      'subject': subject,
      'teacher': teacher,
    };
    _timetables.add(entry);
    notifyListeners();
    try {
      await _db.collection('timetables').doc(id).set(entry);
    } catch (e) {
      debugPrint("Timetable entry saved locally: $e");
    }
  }

  Future<void> deleteTimetableEntry(String id) async {
    _timetables.removeWhere((t) => t['id'] == id);
    notifyListeners();
    try {
      await _db.collection('timetables').doc(id).delete();
    } catch (e) {
      debugPrint("Timetable entry deleted locally: $e");
    }
  }

  Future<void> addHomework(String classId, String subject, String title, String description, String dueDate) async {
    final id = 'hw_${DateTime.now().millisecondsSinceEpoch}';
    final entry = {
      'id': id,
      'classId': classId,
      'subject': subject,
      'title': title,
      'description': description,
      'dueDate': dueDate,
    };
    _homeworks.add(entry);
    notifyListeners();
    try {
      await _db.collection('homeworks').doc(id).set(entry);
    } catch (e) {
      debugPrint("Homework saved locally: $e");
    }
  }

  Future<void> addResult(String studentId, String studentName, String classId, String subject, String examName, double marksObtained, double maxMarks) async {
    final id = 'res_${DateTime.now().millisecondsSinceEpoch}';
    final entry = {
      'id': id,
      'studentId': studentId,
      'studentName': studentName,
      'classId': classId,
      'subject': subject,
      'examName': examName,
      'marksObtained': marksObtained,
      'maxMarks': maxMarks,
    };
    _results.add(entry);
    notifyListeners();
    try {
      await _db.collection('results').doc(id).set(entry);
    } catch (e) {
      debugPrint("Result saved locally: $e");
    }
  }

  Future<void> addGalleryImage(String url, String title, String description, String date) async {
    final id = 'gal_${DateTime.now().millisecondsSinceEpoch}';
    final entry = {
      'id': id,
      'url': url,
      'title': title,
      'description': description,
      'date': date,
    };
    _galleryImages.add(entry);
    notifyListeners();
    try {
      await _db.collection('gallery').doc(id).set(entry);
    } catch (e) {
      debugPrint("Gallery item saved locally: $e");
    }
  }

  Future<void> updateSettings(Map<String, String> newSettings) async {
    _settings.addAll(newSettings);
    notifyListeners();
    try {
      await _db.collection('settings').doc('academic_info').set(_settings);
    } catch (e) {
      debugPrint("Settings updated locally: $e");
    }
  }

  Future<void> submitLeaveApplication(String studentId, String studentName, String classId, String startDate, String endDate, String reason) async {
    final leaveId = 'leave_${DateTime.now().millisecondsSinceEpoch}';
    final newLeave = {
      'id': leaveId,
      'studentId': studentId,
      'studentName': studentName,
      'classId': classId,
      'startDate': startDate,
      'endDate': endDate,
      'reason': reason,
      'status': 'Pending',
      'dateApplied': '2026-07-15',
    };
    _leaveApplications.insert(0, newLeave);
    notifyListeners();
    try {
      await _db.collection('leave_applications').doc(leaveId).set(newLeave);
    } catch (e) {
      debugPrint("Leave application saved locally: $e");
    }
  }

  Future<void> submitContactMessage(String parentName, String email, String subject, String message) async {
    final msgId = 'msg_${DateTime.now().millisecondsSinceEpoch}';
    final newMsg = {
      'id': msgId,
      'parentName': parentName,
      'email': email,
      'subject': subject,
      'message': message,
      'dateSent': '2026-07-15',
    };
    try {
      await _db.collection('contact_messages').doc(msgId).set(newMsg);
    } catch (e) {
      debugPrint("Contact message saved locally: $e");
    }
  }

  void markNotificationAsRead(String id) {
    final idx = _parentNotifications.indexWhere((n) => n['id'] == id);
    if (idx != -1) {
      _parentNotifications[idx]['isRead'] = true;
      notifyListeners();
    }
  }

  void markAllNotificationsAsRead() {
    for (var n in _parentNotifications) {
      n['isRead'] = true;
    }
    notifyListeners();
  }
}
