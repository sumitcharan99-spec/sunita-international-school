import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';
import '../../models/student.dart';

class AdminStudents extends StatefulWidget {
  const AdminStudents({super.key});

  @override
  State<AdminStudents> createState() => _AdminStudentsState();
}

class _AdminStudentsState extends State<AdminStudents> {
  final _searchCtrl = TextEditingController();
  String _filterClass = 'All';

  // Controller states for Add / Edit Dialogs
  final _nameCtrl = TextEditingController();
  final _rollCtrl = TextEditingController();
  final _dobCtrl = TextEditingController(text: '2010-04-12');
  final _bloodCtrl = TextEditingController(text: 'O+');
  final _addressCtrl = TextEditingController(text: 'Sector 12, Dwarka, Delhi');
  final _aadhaarCtrl = TextEditingController();
  final _emergencyCtrl = TextEditingController();
  final _parentNameCtrl = TextEditingController();
  final _parentPhoneCtrl = TextEditingController();
  final _parentEmailCtrl = TextEditingController();
  final _photoUrlCtrl = TextEditingController();
  String _dialogSelectedClass = 'Class 10A';

  @override
  void dispose() {
    _searchCtrl.dispose();
    _nameCtrl.dispose();
    _rollCtrl.dispose();
    _dobCtrl.dispose();
    _bloodCtrl.dispose();
    _addressCtrl.dispose();
    _aadhaarCtrl.dispose();
    _emergencyCtrl.dispose();
    _parentNameCtrl.dispose();
    _parentPhoneCtrl.dispose();
    _parentEmailCtrl.dispose();
    _photoUrlCtrl.dispose();
    super.dispose();
  }

  // --- Show Add / Edit Student Dialog ---
  void _showStudentFormDialog(PortalService service, Student? existing) {
    if (existing != null) {
      _nameCtrl.text = existing.name;
      _rollCtrl.text = existing.rollNo;
      _dobCtrl.text = existing.dob;
      _bloodCtrl.text = existing.bloodGroup;
      _addressCtrl.text = existing.address;
      _aadhaarCtrl.text = existing.aadhaarNo;
      _emergencyCtrl.text = existing.emergencyContact;
      _parentNameCtrl.text = existing.parentName;
      _parentPhoneCtrl.text = existing.parentPhone;
      _parentEmailCtrl.text = existing.parentEmail;
      _photoUrlCtrl.text = existing.photoUrl;
      _dialogSelectedClass = existing.classId;
    } else {
      _nameCtrl.clear();
      _rollCtrl.text = (1 + service.students.length).toString();
      _dobCtrl.text = '2011-05-18';
      _bloodCtrl.text = 'O+';
      _addressCtrl.text = 'Dwarka, New Delhi';
      _aadhaarCtrl.clear();
      _emergencyCtrl.clear();
      _parentNameCtrl.clear();
      _parentPhoneCtrl.clear();
      _parentEmailCtrl.clear();
      _photoUrlCtrl.clear();
      _dialogSelectedClass = 'Class 10A';
    }

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Icon(existing == null ? Icons.person_add_rounded : Icons.edit_note_rounded, color: AppTheme.primaryNavy),
              const SizedBox(width: 12),
              Text(
                existing == null ? 'Register New Student' : 'Update Student Details',
                style: GoogleFonts.spaceGrotesk(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ],
          ),
          content: SizedBox(
            width: 500,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (existing == null)
                    Container(
                      padding: const EdgeInsets.all(8),
                      margin: const EdgeInsets.bottom(12),
                      decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(6)),
                      child: Row(
                        children: [
                          const Icon(Icons.stars, color: Colors.amber, size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Admission No will be auto-generated: ${service.generateAdmissionNumber()}',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.orange),
                            ),
                          ),
                        ],
                      ),
                    ),
                  TextField(
                    controller: _nameCtrl,
                    decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder(), prefixIcon: Icon(Icons.person)),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _rollCtrl,
                          decoration: const InputDecoration(labelText: 'Roll No', border: OutlineInputBorder()),
                          keyboardType: TextInputType.number,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _dialogSelectedClass,
                          decoration: const InputDecoration(labelText: 'Class Section', border: OutlineInputBorder()),
                          items: const [
                            DropdownMenuItem(value: 'Class 9A', child: Text('Class 9A')),
                            DropdownMenuItem(value: 'Class 10A', child: Text('Class 10A')),
                            DropdownMenuItem(value: 'Class 10B', child: Text('Class 10B')),
                            DropdownMenuItem(value: 'Class 10C', child: Text('Class 10C')),
                            DropdownMenuItem(value: 'Class 11A', child: Text('Class 11A')),
                            DropdownMenuItem(value: 'Class 12A', child: Text('Class 12A')),
                          ],
                          onChanged: (val) {
                            if (val != null) _dialogSelectedClass = val;
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text('Personal & Bio Details', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
                  const Divider(),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _dobCtrl,
                          decoration: const InputDecoration(labelText: 'DOB (YYYY-MM-DD)', border: OutlineInputBorder()),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _bloodCtrl,
                          decoration: const InputDecoration(labelText: 'Blood Group', border: OutlineInputBorder()),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _aadhaarCtrl,
                    decoration: const InputDecoration(labelText: 'Aadhaar Card Number', border: OutlineInputBorder(), prefixIcon: Icon(Icons.fingerprint)),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _addressCtrl,
                    decoration: const InputDecoration(labelText: 'Residential Address', border: OutlineInputBorder(), prefixIcon: Icon(Icons.home)),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _emergencyCtrl,
                    decoration: const InputDecoration(labelText: 'Emergency Contact No', border: OutlineInputBorder(), prefixIcon: Icon(Icons.phone_android)),
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 14),
                  Text('Parent / Guardian Contact', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
                  const Divider(),
                  TextField(
                    controller: _parentNameCtrl,
                    decoration: const InputDecoration(labelText: 'Parent / Guardian Name', border: OutlineInputBorder(), prefixIcon: Icon(Icons.people)),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _parentPhoneCtrl,
                          decoration: const InputDecoration(labelText: 'Parent Phone', border: OutlineInputBorder()),
                          keyboardType: TextInputType.phone,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _parentEmailCtrl,
                          decoration: const InputDecoration(labelText: 'Parent Email', border: OutlineInputBorder()),
                          keyboardType: TextInputType.emailAddress,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _photoUrlCtrl,
                    decoration: const InputDecoration(labelText: 'Photo Image URL (Optional)', border: OutlineInputBorder(), prefixIcon: Icon(Icons.image)),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryNavy, foregroundColor: Colors.white),
              onPressed: () {
                if (_nameCtrl.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter a valid student name.')));
                  return;
                }
                final sId = existing?.id ?? 'std_${DateTime.now().millisecondsSinceEpoch}';
                final admissionNo = existing?.admissionNo ?? service.generateAdmissionNumber();

                final updatedStudent = Student(
                  id: sId,
                  name: _nameCtrl.text.trim(),
                  rollNo: _rollCtrl.text.trim(),
                  classId: _dialogSelectedClass,
                  admissionNo: admissionNo,
                  dob: _dobCtrl.text.trim(),
                  bloodGroup: _bloodCtrl.text.trim(),
                  address: _addressCtrl.text.trim(),
                  aadhaarNo: _aadhaarCtrl.text.trim(),
                  emergencyContact: _emergencyCtrl.text.trim(),
                  parentName: _parentNameCtrl.text.trim(),
                  parentPhone: _parentPhoneCtrl.text.trim(),
                  parentEmail: _parentEmailCtrl.text.trim(),
                  photoUrl: _photoUrlCtrl.text.trim(),
                  documents: existing?.documents ?? [],
                );

                service.saveStudent(updatedStudent);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(existing == null ? 'Student registered successfully!' : 'Student profile updated!')),
                );
              },
              child: const Text('Save Registry', style: TextStyle(fontWeight: FontWeight.bold)),
            )
          ],
        );
      },
    );
  }

  // --- Show Complete Student Profile Dialog with internal Tabs ---
  void _showStudentProfileDialog(PortalService service, Student s) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Container(
            width: 600,
            padding: const EdgeInsets.all(24),
            child: _StudentProfileTabbedView(student: s, service: service),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final searchKeyword = _searchCtrl.text.toLowerCase();

    final filteredList = service.students.where((s) {
      final matchesSearch = s.name.toLowerCase().contains(searchKeyword) ||
          s.admissionNo.toLowerCase().contains(searchKeyword) ||
          s.rollNo.contains(searchKeyword);
      final matchesClass = _filterClass == 'All' || s.classId == _filterClass;
      return matchesSearch && matchesClass;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: AppTheme.accentAmber,
        onPressed: () => _showStudentFormDialog(service, null),
        child: const Icon(Icons.person_add),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sunita Student Registry',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryNavy,
              ),
            ),
            const Text(
              'Manage student directory profiles, trigger class transfers, promotions, and review fee/attendance history.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 16),

            // Search Bar
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    onChanged: (v) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: 'Search by student name, admission number, roll...',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _filterClass,
                      style: const TextStyle(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold),
                      items: const [
                        DropdownMenuItem(value: 'All', child: Text('All Classes')),
                        DropdownMenuItem(value: 'Class 9A', child: Text('Class 9A')),
                        DropdownMenuItem(value: 'Class 10A', child: Text('Class 10A')),
                        DropdownMenuItem(value: 'Class 10B', child: Text('Class 10B')),
                        DropdownMenuItem(value: 'Class 10C', child: Text('Class 10C')),
                        DropdownMenuItem(value: 'Class 11A', child: Text('Class 11A')),
                        DropdownMenuItem(value: 'Class 12A', child: Text('Class 12A')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _filterClass = val);
                      },
                    ),
                  ),
                )
              ],
            ),
            const SizedBox(height: 12),

            // Roster List view
            Expanded(
              child: filteredList.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.people_outline_rounded, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 12),
                          const Text('No student records matched search query.'),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: filteredList.length,
                      itemBuilder: (context, index) {
                        final s = filteredList[index];
                        return Card(
                          color: Colors.white,
                          elevation: 1,
                          margin: const EdgeInsets.only(bottom: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: Hero(
                              tag: 'avatar-${s.id}',
                              child: CircleAvatar(
                                backgroundColor: AppTheme.primaryNavy.withOpacity(0.1),
                                backgroundImage: s.photoUrl.isNotEmpty ? NetworkImage(s.photoUrl) : null,
                                child: s.photoUrl.isEmpty ? const Icon(Icons.face, color: AppTheme.primaryNavy) : null,
                              ),
                            ),
                            title: Text(
                              s.name,
                              style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
                            ),
                            subtitle: Text(
                              'Adm No: ${s.admissionNo} • Class: ${s.classId} • Roll: ${s.rollNo}',
                              style: const TextStyle(fontSize: 11, color: Colors.black54),
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.visibility_rounded, color: AppTheme.primaryNavy, size: 20),
                                  tooltip: 'View Profile details',
                                  onPressed: () => _showStudentProfileDialog(service, s),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.edit_note_outlined, color: Colors.blueAccent, size: 20),
                                  tooltip: 'Edit Profile',
                                  onPressed: () => _showStudentFormDialog(service, s),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                                  tooltip: 'Expel Student',
                                  onPressed: () {
                                    showDialog(
                                      context: context,
                                      builder: (context) {
                                        return AlertDialog(
                                          title: const Text('Expel Student?'),
                                          content: Text('Are you sure you want to permanently remove ${s.name} from Sunita school lists?'),
                                          actions: [
                                            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                            TextButton(
                                              onPressed: () {
                                                service.deleteStudent(s.id);
                                                Navigator.pop(context);
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  SnackBar(content: Text('Removed ${s.name} successfully.')),
                                                );
                                              },
                                              child: const Text('Delete Student', style: TextStyle(color: Colors.red)),
                                            )
                                          ],
                                        );
                                      },
                                    );
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

// --- Dynamic Profile Detail tabbed component ---
class _StudentProfileTabbedView extends StatefulWidget {
  final Student student;
  final PortalService service;

  const _StudentProfileTabbedView({required this.student, required this.service});

  @override
  State<_StudentProfileTabbedView> createState() => _StudentProfileTabbedViewState();
}

class _StudentProfileTabbedViewState extends State<_StudentProfileTabbedView> with SingleTickerProviderStateMixin {
  late TabController _profileTabCtrl;
  final List<String> _simulatedUploadedDocuments = [];

  @override
  void initState() {
    super.initState();
    _profileTabCtrl = TabController(length: 4, vsync: this);
    _simulatedUploadedDocuments.addAll(widget.student.documents);
  }

  @override
  void dispose() {
    _profileTabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.student;
    // Specific student fees
    final studentFees = widget.service.fees.where((f) => f.studentId == s.id).toList();

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Profile Header Block
        Row(
          children: [
            CircleAvatar(
              radius: 36,
              backgroundColor: AppTheme.primaryNavy.withOpacity(0.1),
              backgroundImage: s.photoUrl.isNotEmpty ? NetworkImage(s.photoUrl) : null,
              child: s.photoUrl.isEmpty ? const Icon(Icons.face, size: 36, color: AppTheme.primaryNavy) : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    s.name,
                    style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                  ),
                  Text(
                    'Admission Code: ${s.admissionNo} • Roll: ${s.rollNo}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Current Placement: ${s.classId}',
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => Navigator.pop(context),
            )
          ],
        ),
        const SizedBox(height: 16),

        // Tabs
        TabBar(
          controller: _profileTabCtrl,
          labelColor: AppTheme.primaryNavy,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppTheme.primaryNavy,
          labelStyle: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 12),
          tabs: const [
            Tab(icon: Icon(Icons.badge, size: 18), text: 'Info & Parents'),
            Tab(icon: Icon(Icons.transfer_within_a_station, size: 18), text: 'Transfer / Promote'),
            Tab(icon: Icon(Icons.history, size: 18), text: 'History'),
            Tab(icon: Icon(Icons.file_upload_outlined, size: 18), text: 'Documents'),
          ],
        ),
        const SizedBox(height: 16),

        // Tab Views
        SizedBox(
          height: 280,
          child: TabBarView(
            controller: _profileTabCtrl,
            children: [
              // Info & Parents
              SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader('Bio-Metrics & Personal Details'),
                    _buildProfileRow(Icons.cake_outlined, 'Date of Birth', s.dob),
                    _buildProfileRow(Icons.bloodtype_outlined, 'Blood Group', s.bloodGroup),
                    _buildProfileRow(Icons.fingerprint, 'Aadhaar Number', s.aadhaarNo.isNotEmpty ? s.aadhaarNo : 'Not Provided'),
                    _buildProfileRow(Icons.home_outlined, 'Home Address', s.address),
                    _buildProfileRow(Icons.contact_phone_outlined, 'Emergency Call contact', s.emergencyContact.isNotEmpty ? s.emergencyContact : 'N/A'),
                    const SizedBox(height: 14),
                    _buildSectionHeader('Parent Details'),
                    _buildProfileRow(Icons.supervisor_account, 'Parent/Guardian', s.parentName.isNotEmpty ? s.parentName : 'Not Registered'),
                    _buildProfileRow(Icons.phone, 'Parent Contact Number', s.parentPhone.isNotEmpty ? s.parentPhone : 'N/A'),
                    _buildProfileRow(Icons.email, 'Parent Email ID', s.parentEmail.isNotEmpty ? s.parentEmail : 'N/A'),
                  ],
                ),
              ),

              // Transfer / Promote
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader('Placement Transfer Actions'),
                  const SizedBox(height: 10),
                  Text(
                    'Class & Section Transfer',
                    style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const Text('Move this student to another section instantly.', style: TextStyle(fontSize: 11, color: Colors.grey)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: s.classId,
                          decoration: const InputDecoration(labelText: 'Transfer to Class', border: OutlineInputBorder()),
                          items: const [
                            DropdownMenuItem(value: 'Class 9A', child: Text('Class 9A')),
                            DropdownMenuItem(value: 'Class 10A', child: Text('Class 10A')),
                            DropdownMenuItem(value: 'Class 10B', child: Text('Class 10B')),
                            DropdownMenuItem(value: 'Class 10C', child: Text('Class 10C')),
                            DropdownMenuItem(value: 'Class 11A', child: Text('Class 11A')),
                            DropdownMenuItem(value: 'Class 12A', child: Text('Class 12A')),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              final updated = Student(
                                id: s.id,
                                name: s.name,
                                rollNo: s.rollNo,
                                classId: val,
                                admissionNo: s.admissionNo,
                                dob: s.dob,
                                bloodGroup: s.bloodGroup,
                                address: s.address,
                                aadhaarNo: s.aadhaarNo,
                                emergencyContact: s.emergencyContact,
                                parentName: s.parentName,
                                parentPhone: s.parentPhone,
                                parentEmail: s.parentEmail,
                                photoUrl: s.photoUrl,
                                documents: s.documents,
                              );
                              widget.service.saveStudent(updated);
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('${s.name} transferred to $val successfully!')),
                              );
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),
                  Text(
                    'Student Annual Promotion',
                    style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                  const Text('Promote student to the next subsequent standard level (e.g. 10A -> 11A).',
                      style: TextStyle(fontSize: 11, color: Colors.grey)),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(45),
                    ),
                    icon: const Icon(Icons.trending_up),
                    label: const Text('Promote Student', style: TextStyle(fontWeight: FontWeight.bold)),
                    onPressed: () {
                      String nextClass = 'Class 11A';
                      if (s.classId.contains('9A')) nextClass = 'Class 10A';
                      if (s.classId.contains('10A')) nextClass = 'Class 11A';
                      if (s.classId.contains('11A')) nextClass = 'Class 12A';
                      if (s.classId.contains('12A')) nextClass = 'Graduated';

                      final updated = Student(
                        id: s.id,
                        name: s.name,
                        rollNo: s.rollNo,
                        classId: nextClass,
                        admissionNo: s.admissionNo,
                        dob: s.dob,
                        bloodGroup: s.bloodGroup,
                        address: s.address,
                        aadhaarNo: s.aadhaarNo,
                        emergencyContact: s.emergencyContact,
                        parentName: s.parentName,
                        parentPhone: s.parentPhone,
                        parentEmail: s.parentEmail,
                        photoUrl: s.photoUrl,
                        documents: s.documents,
                      );
                      widget.service.saveStudent(updated);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${s.name} promoted successfully to $nextClass!')),
                      );
                    },
                  )
                ],
              ),

              // History (Fees & Attendance)
              SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader('Class Attendance History'),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('Calculated Working Days: 45', style: TextStyle(fontSize: 11)),
                        Text('Attendance: 95.5%', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: const LinearProgressIndicator(
                        value: 0.955,
                        minHeight: 8,
                        backgroundColor: Colors.grey,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.green),
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildSectionHeader('Student Specific Fee ledger history'),
                    if (studentFees.isEmpty)
                      const Text('No invoices issued yet to this student account.', style: TextStyle(fontSize: 11, color: Colors.grey))
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: studentFees.length,
                        itemBuilder: (context, idx) {
                          final f = studentFees[idx];
                          final paid = f.status == 'paid';
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('${f.termName} • Due: ${f.dueDate}', style: const TextStyle(fontSize: 10)),
                                Text(
                                  '₹${f.amount.toStringAsFixed(0)} (${f.status.toUpperCase()})',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: paid ? Colors.green : Colors.red,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      )
                  ],
                ),
              ),

              // Documents Upload
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader('Student Digital Documents Locker'),
                  const SizedBox(height: 8),

                  // Upload Zone Simulation
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _simulatedUploadedDocuments.add('Uploaded_Doc_${_simulatedUploadedDocuments.length + 1}.pdf');
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Document uploaded & saved to secure Cloud Storage!')),
                      );
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      decoration: BoxDecoration(
                        color: Colors.slate.shade50,
                        border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: const [
                          Icon(Icons.cloud_upload_outlined, size: 36, color: AppTheme.primaryNavy),
                          SizedBox(height: 8),
                          Text('Choose file or Drag & Drop here', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          Text('PDF, PNG, JPG up to 10MB', style: TextStyle(fontSize: 9, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text('Active Vaulted Documents:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black54)),
                  const SizedBox(height: 6),
                  Expanded(
                    child: _simulatedUploadedDocuments.isEmpty
                        ? const Text('No documents uploaded yet.', style: TextStyle(fontSize: 10, color: Colors.grey))
                        : ListView.builder(
                            itemCount: _simulatedUploadedDocuments.length,
                            itemBuilder: (context, idx) {
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 2),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.between,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.picture_as_pdf_outlined, color: Colors.redAccent, size: 14),
                                        const SizedBox(width: 6),
                                        Text(_simulatedUploadedDocuments[idx], style: const TextStyle(fontSize: 10)),
                                      ],
                                    ),
                                    const Icon(Icons.check_circle, color: Colors.green, size: 14),
                                  ],
                                ),
                              );
                            },
                          ),
                  )
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String val) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, top: 4.0),
      child: Text(
        val.toUpperCase(),
        style: GoogleFonts.spaceGrotesk(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: Colors.grey.shade700,
          letterSpacing: 1,
        ),
      ),
    );
  }

  Widget _buildProfileRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 14, color: AppTheme.primaryNavy.withOpacity(0.7)),
          const SizedBox(width: 10),
          Text('$label: ', style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 11, color: Colors.black85, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
