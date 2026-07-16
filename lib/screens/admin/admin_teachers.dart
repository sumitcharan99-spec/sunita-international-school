import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/portal_service.dart';
import '../../models/staff_member.dart';
import '../../theme/app_theme.dart';

class AdminTeachers extends StatefulWidget {
  const AdminTeachers({super.key});

  @override
  State<AdminTeachers> createState() => _AdminTeachersState();
}

class _AdminTeachersState extends State<AdminTeachers> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  String _searchQuery = '';
  String _roleFilter = 'All';

  // State for Add / Edit Staff Dialog
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _designationCtrl = TextEditingController(text: 'Faculty Instructor');
  final _departmentCtrl = TextEditingController(text: 'Academics');
  final _joiningDateCtrl = TextEditingController(text: '2025-01-15');
  final _qualificationCtrl = TextEditingController(text: 'B.Ed, Post-Graduation');
  final _experienceCtrl = TextEditingController(text: '3 Years');
  final _salaryCtrl = TextEditingController(text: '45000');
  final _aadhaarCtrl = TextEditingController();
  final _panCtrl = TextEditingController();
  final _bankCtrl = TextEditingController(text: 'State Bank of India A/C: 12345678 IFSC: SBIN0001234');
  final _photoCtrl = TextEditingController();
  String _selectedRole = 'teacher';

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _designationCtrl.dispose();
    _departmentCtrl.dispose();
    _joiningDateCtrl.dispose();
    _qualificationCtrl.dispose();
    _experienceCtrl.dispose();
    _salaryCtrl.dispose();
    _aadhaarCtrl.dispose();
    _panCtrl.dispose();
    _bankCtrl.dispose();
    _photoCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    // Filter staff
    final filteredStaff = service.staff.where((s) {
      final matchesSearch = s.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.designation.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          s.department.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesRole = _roleFilter == 'All' || s.role == _roleFilter;
      return matchesSearch && matchesRole;
    }).toList();

    return Column(
      children: [
        // Tab header
        Container(
          color: AppTheme.primaryNavy,
          child: TabBar(
            controller: _tabCtrl,
            labelColor: AppTheme.accentAmber,
            unselectedLabelColor: Colors.white70,
            indicatorColor: AppTheme.accentAmber,
            indicatorWeight: 3,
            labelStyle: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: const [
              Tab(icon: Icon(Icons.badge_outlined), text: 'Staff Registry'),
              Tab(icon: Icon(Icons.co_present_rounded), text: 'Attendance'),
              Tab(icon: Icon(Icons.edit_calendar_outlined), text: 'Leave Management'),
              Tab(icon: Icon(Icons.payments_outlined), text: 'Salaries & Payroll'),
            ],
          ),
        ),
        // Tab views
        Expanded(
          child: TabBarView(
            controller: _tabCtrl,
            children: [
              _buildStaffRegistryTab(service, filteredStaff),
              _buildAttendanceTab(service),
              _buildLeaveTab(service),
              _buildSalaryTab(service),
            ],
          ),
        ),
      ],
    );
  }

  // ================= TAB 1: STAFF REGISTRY =================
  Widget _buildStaffRegistryTab(PortalService service, List<StaffMember> filteredStaff) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: AppTheme.accentAmber,
        onPressed: () => _showStaffFormDialog(service, null),
        child: const Icon(Icons.add_to_photos_rounded),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'School Faculty Directory',
                      style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                    ),
                    Text('Manage instructors, administration, security and general support staff.',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Search and Role filter
            Row(
              children: [
                Expanded(
                  child: TextField(
                    decoration: const InputDecoration(
                      hintText: 'Search staff by name, designation, department...',
                      prefixIcon: Icon(Icons.search),
                      border: OutlineInputBorder(),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                    onChanged: (val) {
                      setState(() => _searchQuery = val);
                    },
                  ),
                ),
                const SizedBox(width: 10),
                DropdownButton<String>(
                  value: _roleFilter,
                  style: const TextStyle(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold),
                  items: const [
                    DropdownMenuItem(value: 'All', child: Text('All Roles')),
                    DropdownMenuItem(value: 'teacher', child: Text('Teachers')),
                    DropdownMenuItem(value: 'admin', child: Text('Admin Staff')),
                    DropdownMenuItem(value: 'staff', child: Text('Support Staff')),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _roleFilter = val);
                  },
                )
              ],
            ),
            const SizedBox(height: 16),

            Expanded(
              child: filteredStaff.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.badge_outlined, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 10),
                          const Text('No staff registry records found matching details.'),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: filteredStaff.length,
                      itemBuilder: (context, idx) {
                        final s = filteredStaff[idx];
                        return Card(
                          color: Colors.white,
                          elevation: 1,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppTheme.primaryNavy.withOpacity(0.1),
                              backgroundImage: s.photoUrl.isNotEmpty ? NetworkImage(s.photoUrl) : null,
                              child: s.photoUrl.isEmpty ? const Icon(Icons.person, color: AppTheme.primaryNavy) : null,
                            ),
                            title: Text(
                              s.name,
                              style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primaryNavy),
                            ),
                            subtitle: Text(
                              '${s.designation} • ${s.department} [${s.role.toUpperCase()}]',
                              style: const TextStyle(fontSize: 11, color: Colors.black54),
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.contact_mail_outlined, color: AppTheme.primaryNavy, size: 20),
                                  tooltip: 'ID Card & Profile',
                                  onPressed: () => _showStaffProfileDialog(service, s),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined, color: Colors.blueAccent, size: 20),
                                  tooltip: 'Edit details',
                                  onPressed: () => _showStaffFormDialog(service, s),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                                  tooltip: 'Delete Staff Member',
                                  onPressed: () {
                                    showDialog(
                                      context: context,
                                      builder: (context) => AlertDialog(
                                        title: const Text('Delete Staff Member?'),
                                        content: Text('Are you sure you want to completely erase ${s.name} from records?'),
                                        actions: [
                                          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                                          TextButton(
                                            onPressed: () {
                                              service.deleteStaff(s.id);
                                              Navigator.pop(context);
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                SnackBar(content: Text('${s.name} removed from registry.')),
                                              );
                                            },
                                            child: const Text('Erase', style: TextStyle(color: Colors.red)),
                                          )
                                        ],
                                      ),
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

  void _showStaffFormDialog(PortalService service, StaffMember? existing) {
    if (existing != null) {
      _nameCtrl.text = existing.name;
      _emailCtrl.text = existing.email;
      _phoneCtrl.text = existing.phone;
      _designationCtrl.text = existing.designation;
      _departmentCtrl.text = existing.department;
      _joiningDateCtrl.text = existing.joiningDate;
      _qualificationCtrl.text = existing.qualification;
      _experienceCtrl.text = existing.experience;
      _salaryCtrl.text = existing.salary;
      _aadhaarCtrl.text = existing.aadhaarNo;
      _panCtrl.text = existing.panNo;
      _bankCtrl.text = existing.bankDetails;
      _photoCtrl.text = existing.photoUrl;
      _selectedRole = existing.role;
    } else {
      _nameCtrl.clear();
      _emailCtrl.clear();
      _phoneCtrl.clear();
      _designationCtrl.text = 'Faculty Instructor';
      _departmentCtrl.text = 'Academics';
      _joiningDateCtrl.text = '2026-07-15';
      _qualificationCtrl.text = 'M.Sc (Physics), B.Ed';
      _experienceCtrl.text = '4 Years';
      _salaryCtrl.text = '45000';
      _aadhaarCtrl.clear();
      _panCtrl.clear();
      _bankCtrl.text = 'State Bank of India A/C: 123456789 IFSC: SBIN0001234';
      _photoCtrl.clear();
      _selectedRole = 'teacher';
    }

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          title: Text(
            existing == null ? 'Recruit New Faculty / Staff' : 'Modify Faculty Details',
            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
          ),
          content: SizedBox(
            width: 500,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: _nameCtrl,
                    decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder(), prefixIcon: Icon(Icons.person)),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _emailCtrl,
                          decoration: const InputDecoration(labelText: 'Professional Email', border: OutlineInputBorder()),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _phoneCtrl,
                          decoration: const InputDecoration(labelText: 'Mobile Phone', border: OutlineInputBorder()),
                          keyboardType: TextInputType.phone,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _selectedRole,
                    decoration: const InputDecoration(labelText: 'System Access Role', border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'teacher', child: Text('Teacher Faculty')),
                      DropdownMenuItem(value: 'admin', child: Text('Admin Management')),
                      DropdownMenuItem(value: 'staff', child: Text('Support Staff')),
                    ],
                    onChanged: (val) {
                      if (val != null) _selectedRole = val;
                    },
                  ),
                  const SizedBox(height: 12),
                  Text('Professional Details', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
                  const Divider(),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _designationCtrl,
                          decoration: const InputDecoration(labelText: 'Designation (Title)', border: OutlineInputBorder()),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _departmentCtrl,
                          decoration: const InputDecoration(labelText: 'Department', border: OutlineInputBorder()),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _joiningDateCtrl,
                          decoration: const InputDecoration(labelText: 'Joining Date', border: OutlineInputBorder()),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _experienceCtrl,
                          decoration: const InputDecoration(labelText: 'Experience Level', border: OutlineInputBorder()),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _qualificationCtrl,
                    decoration: const InputDecoration(labelText: 'Educational Qualifications', border: OutlineInputBorder(), prefixIcon: Icon(Icons.school)),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _salaryCtrl,
                          decoration: const InputDecoration(labelText: 'Monthly Salary (₹)', border: OutlineInputBorder()),
                          keyboardType: TextInputType.number,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: _panCtrl,
                          decoration: const InputDecoration(labelText: 'PAN Card Number', border: OutlineInputBorder()),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _aadhaarCtrl,
                    decoration: const InputDecoration(labelText: 'Aadhaar Number', border: OutlineInputBorder(), prefixIcon: Icon(Icons.fingerprint)),
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _bankCtrl,
                    decoration: const InputDecoration(labelText: 'Bank Account & IFSC', border: OutlineInputBorder(), prefixIcon: Icon(Icons.account_balance_wallet)),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _photoCtrl,
                    decoration: const InputDecoration(labelText: 'Profile Picture Url', border: OutlineInputBorder(), prefixIcon: Icon(Icons.image)),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel', style: TextStyle(color: Colors.grey))),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryNavy, foregroundColor: Colors.white),
              onPressed: () {
                if (_nameCtrl.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Name is required.')));
                  return;
                }
                final id = existing?.id ?? 'staff_${DateTime.now().millisecondsSinceEpoch}';
                final s = StaffMember(
                  id: id,
                  name: _nameCtrl.text.trim(),
                  email: _emailCtrl.text.trim(),
                  role: _selectedRole,
                  phone: _phoneCtrl.text.trim(),
                  designation: _designationCtrl.text.trim(),
                  department: _departmentCtrl.text.trim(),
                  joiningDate: _joiningDateCtrl.text.trim(),
                  qualification: _qualificationCtrl.text.trim(),
                  experience: _experienceCtrl.text.trim(),
                  salary: _salaryCtrl.text.trim(),
                  aadhaarNo: _aadhaarCtrl.text.trim(),
                  panNo: _panCtrl.text.trim(),
                  bankDetails: _bankCtrl.text.trim(),
                  photoUrl: _photoCtrl.text.trim(),
                  attendanceLogs: existing?.attendanceLogs ?? ['2026-07-15'],
                  leaves: existing?.leaves ?? [],
                );
                service.saveStaff(s);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(existing == null ? 'Staff member recruited successfully!' : 'Staff details updated!')),
                );
              },
              child: const Text('Save Registry'),
            ),
          ],
        );
      },
    );
  }

  // ================= TAB 2: STAFF DAILY ATTENDANCE =================
  Widget _buildAttendanceTab(PortalService service) {
    final today = '2026-07-15';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            justifyAxisAlignment: MainAxisAlignment.between,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Daily Attendance Register',
                    style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                  ),
                  Text('Mark daily attendance, log presence or absents and generate audit summaries.',
                      style: const TextStyle(fontSize: 11, color: Colors.grey)),
                ],
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryNavy,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                ),
                icon: const Icon(Icons.picture_as_pdf, size: 16),
                label: const Text('Attendance Audit Report PDF', style: TextStyle(fontSize: 11)),
                onPressed: () => _showAttendanceReportDialog(service),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Date indicator
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: Colors.teal.shade50, borderRadius: BorderRadius.circular(8)),
            child: Row(
              children: [
                const Icon(Icons.today, color: Colors.teal, size: 18),
                const SizedBox(width: 8),
                Text(
                  'Marking Daily Attendance: Wednesday, 15th July 2026',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.teal.shade900),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          if (service.staff.isEmpty)
            const Center(child: Text('No staff members registered.'))
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: service.staff.length,
              itemBuilder: (context, idx) {
                final s = service.staff[idx];
                final isPresent = s.attendanceLogs.contains(today);

                return Card(
                  color: Colors.white,
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isPresent ? Colors.green.shade50 : Colors.red.shade50,
                      child: Icon(
                        isPresent ? Icons.check : Icons.close,
                        color: isPresent ? Colors.green : Colors.red,
                        size: 16,
                      ),
                    ),
                    title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Text('${s.designation} • ${s.department}', style: const TextStyle(fontSize: 11)),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          isPresent ? 'PRESENT' : 'ABSENT',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isPresent ? Colors.green : Colors.red,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Switch(
                          value: isPresent,
                          activeColor: Colors.green,
                          inactiveTrackColor: Colors.red.shade100,
                          onChanged: (val) {
                            final List<String> logs = List.from(s.attendanceLogs);
                            if (val) {
                              if (!logs.contains(today)) logs.add(today);
                            } else {
                              logs.remove(today);
                            }
                            final updated = StaffMember(
                              id: s.id,
                              name: s.name,
                              email: s.email,
                              role: s.role,
                              phone: s.phone,
                              designation: s.designation,
                              department: s.department,
                              joiningDate: s.joiningDate,
                              qualification: s.qualification,
                              experience: s.experience,
                              salary: s.salary,
                              aadhaarNo: s.aadhaarNo,
                              panNo: s.panNo,
                              bankDetails: s.bankDetails,
                              photoUrl: s.photoUrl,
                              attendanceLogs: logs,
                              leaves: s.leaves,
                            );
                            service.saveStaff(updated);
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            )
        ],
      ),
    );
  }

  // ================= TAB 3: STAFF LEAVE MANAGEMENT =================
  Widget _buildLeaveTab(PortalService service) {
    // Generate simulated leave applications from staff leaves or general list
    final List<Map<String, dynamic>> leaves = [];
    for (var s in service.staff) {
      for (var l in s.leaves) {
        leaves.add({
          'staffId': s.id,
          'staffName': s.name,
          'designation': s.designation,
          'reason': l['reason'] ?? 'Sick Leave request',
          'startDate': l['startDate'] ?? '2026-07-20',
          'endDate': l['endDate'] ?? '2026-07-21',
          'status': l['status'] ?? 'Pending',
        });
      }
    }

    // Default simulation if empty
    if (leaves.isEmpty) {
      leaves.addAll([
        {
          'staffId': 't_1',
          'staffName': 'Mr. Arvind Verma',
          'designation': 'Senior Faculty',
          'reason': 'Family emergency out of town',
          'startDate': '2026-07-22',
          'endDate': '2026-07-24',
          'status': 'Pending',
        },
        {
          'staffId': 't_2',
          'staffName': 'Mrs. Priya Nair',
          'designation': 'Lecturer',
          'reason': 'Routine medical appointment',
          'startDate': '2026-07-18',
          'endDate': '2026-07-18',
          'status': 'Approved',
        }
      ]);
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Staff Leave Applications',
            style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
          ),
          const Text('Review, approve or reject professional leave requests filed by faculty members.',
              style: TextStyle(fontSize: 11, color: Colors.grey)),
          const SizedBox(height: 16),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: leaves.length,
            itemBuilder: (context, idx) {
              final leave = leaves[idx];
              final status = leave['status'] ?? 'Pending';
              final isPending = status == 'Pending';
              final isApproved = status == 'Approved';

              return Card(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: AppTheme.primaryNavy.withOpacity(0.05),
                                child: const Icon(Icons.person, color: AppTheme.primaryNavy, size: 18),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    leave['staffName'],
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  Text(leave['designation'], style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                ],
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isApproved ? Colors.green.shade50 : (isPending ? Colors.amber.shade50 : Colors.red.shade50),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              status.toUpperCase(),
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: isApproved ? Colors.green : (isPending ? Colors.orange : Colors.red),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 20),
                      Text('Reason: "${leave['reason']}"', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic)),
                      const SizedBox(height: 6),
                      Text(
                        'Leave Duration: ${leave['startDate']} to ${leave['endDate']}',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black54),
                      ),
                      if (isPending) ...[
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            TextButton.icon(
                              style: TextButton.styleFrom(foregroundColor: Colors.redAccent),
                              icon: const Icon(Icons.close, size: 16),
                              label: const Text('Decline Request'),
                              onPressed: () {
                                setState(() {
                                  leave['status'] = 'Declined';
                                });
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Leave request declined.')),
                                );
                              },
                            ),
                            const SizedBox(width: 12),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                              icon: const Icon(Icons.check, size: 16),
                              label: const Text('Approve'),
                              onPressed: () {
                                setState(() {
                                  leave['status'] = 'Approved';
                                });
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Leave request approved. Faculty notified.')),
                                );
                              },
                            ),
                          ],
                        )
                      ]
                    ],
                  ),
                ),
              );
            },
          )
        ],
      ),
    );
  }

  // ================= TAB 4: STAFF SALARY & PAYROLL =================
  Widget _buildSalaryTab(PortalService service) {
    final double grossPay = service.staff.fold(0.0, (sum, s) => sum + (double.tryParse(s.salary) ?? 0.0));

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              border: Border.all(color: Colors.green.shade200),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.wallet, color: Colors.green, size: 28),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Monthly Salary Outlay',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
                      ),
                      Text(
                        '₹${grossPay.toStringAsFixed(0)} scheduled for current month across ${service.staff.length} staff members.',
                        style: const TextStyle(fontSize: 11),
                      ),
                    ],
                  ),
                ),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                  ),
                  icon: const Icon(Icons.payments),
                  label: const Text('Disburse Salaries', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Bulk Salary Direct-Deposits triggered! Staff notified.')),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Salary Registry & Bank details',
            style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
          ),
          const SizedBox(height: 10),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: service.staff.length,
            itemBuilder: (context, idx) {
              final s = service.staff[idx];
              return Card(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          Text('Title: ${s.designation} • ${s.department}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                          const SizedBox(height: 4),
                          Text('Bank: ${s.bankDetails}', style: const TextStyle(fontSize: 9, fontStyle: FontStyle.italic)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '₹${s.salary}',
                            style: GoogleFonts.jetbrainsMono(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.green),
                          ),
                          const SizedBox(height: 4),
                          const Text('A/C Status: ACTIVE', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.teal)),
                        ],
                      )
                    ],
                  ),
                ),
              );
            },
          )
        ],
      ),
    );
  }

  // ================= STAFF ID CARD MODAL SIMULATION =================
  void _showStaffProfileDialog(PortalService service, StaffMember s) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Container(
            padding: const EdgeInsets.all(24),
            maxWidth: 450,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('FACULTY ID CARD PREVIEW', style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 14),

                // Beautiful Flip Card Simulation (ID Card)
                Container(
                  width: 280,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppTheme.primaryNavy, Colors.indigo],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 10, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(3),
                            decoration: const BoxDecoration(color: AppTheme.accentAmber, shape: BoxShape.circle),
                            child: const Icon(Icons.school, size: 14, color: AppTheme.primaryNavy),
                          ),
                          Text(
                            'SUNITA INTERNATIONAL',
                            style: GoogleFonts.spaceGrotesk(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      CircleAvatar(
                        radius: 36,
                        backgroundColor: Colors.white,
                        child: CircleAvatar(
                          radius: 33,
                          backgroundColor: Colors.indigo.shade50,
                          backgroundImage: s.photoUrl.isNotEmpty ? NetworkImage(s.photoUrl) : null,
                          child: s.photoUrl.isEmpty ? const Icon(Icons.person, size: 33, color: AppTheme.primaryNavy) : null,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        s.name.toUpperCase(),
                        style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.5),
                      ),
                      Text(
                        s.designation,
                        style: const TextStyle(color: AppTheme.accentAmber, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                        child: Text(
                          'ID: STAFF-${s.id.toUpperCase()}',
                          style: GoogleFonts.jetbrainsMono(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const Divider(color: Colors.white30, height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildIdCardField('Blood Group', 'O+'),
                          _buildIdCardField('Joined Date', s.joiningDate),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Secondary profile details block
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: Colors.slate.shade50, borderRadius: BorderRadius.circular(10)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildProfileRow('Email', s.email),
                      _buildProfileRow('Phone', s.phone),
                      _buildProfileRow('Qualifications', s.qualification),
                      _buildProfileRow('Experience', s.experience),
                      _buildProfileRow('Aadhaar No', s.aadhaarNo),
                      _buildProfileRow('PAN No', s.panNo),
                    ],
                  ),
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildIdCardField(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 7, color: Colors.white70)),
        const SizedBox(height: 1),
        Text(value, style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildProfileRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.between,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
          Text(value.isNotEmpty ? value : 'Not Registered', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  // ================= ATTENDANCE REPORT PDF SIMULATOR =================
  void _showAttendanceReportDialog(PortalService service) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Container(
            padding: const EdgeInsets.all(24),
            maxWidth: 500,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Text('PDF GENERATOR PREVIEW', style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.print_rounded),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Initiating print service...')));
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.download_rounded),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved: Monthly_Staff_Attendance_Report.pdf')));
                          },
                        ),
                        IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                      ],
                    ),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 12),

                // Printed Paper Simulation
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: Colors.grey.shade300, width: 2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Column(
                          children: [
                            Text(
                              'SUNITA INTERNATIONAL SCHOOL',
                              style: GoogleFonts.spaceGrotesk(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                            ),
                            const Text('MONTHLY STAFF ATTENDANCE AUDIT LOGS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
                            const Text('Period: July 1st - July 15th 2026', style: TextStyle(fontSize: 8, color: Colors.black54)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Divider(),

                      // Table rows
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: const [
                          Text('FACULTY MEMBER', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold)),
                          Text('DAYS PRESENT', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold)),
                          Text('ATTENDANCE RATIO', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const Divider(),

                      if (service.staff.isEmpty)
                        const Text('No records', style: TextStyle(fontSize: 8))
                      else
                        ...service.staff.map((s) {
                          final present = s.attendanceLogs.length;
                          final totalDays = 15;
                          final ratio = (present / totalDays) * 100;
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 3),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.between,
                              children: [
                                Text(s.name, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold)),
                                Text('$present / $totalDays Days', style: const TextStyle(fontSize: 8)),
                                Text('${ratio.toStringAsFixed(1)}%', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: ratio > 90 ? Colors.green : Colors.red)),
                              ],
                            ),
                          );
                        }).toList(),

                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(width: 80, height: 1, color: Colors.grey),
                              const SizedBox(height: 3),
                              const Text('Auditor Stamp', style: TextStyle(fontSize: 6, color: Colors.grey)),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Container(width: 80, height: 1, color: Colors.grey),
                              const SizedBox(height: 3),
                              const Text('Principal Signature', style: TextStyle(fontSize: 6, color: Colors.grey)),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
