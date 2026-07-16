import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AdminAdmissions extends StatefulWidget {
  const AdminAdmissions({super.key});

  @override
  State<AdminAdmissions> createState() => _AdminAdmissionsState();
}

class _AdminAdmissionsState extends State<AdminAdmissions> {
  final _studentNameCtrl = TextEditingController();
  final _parentNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String _selectedClass = 'Class 10A';

  @override
  void dispose() {
    _studentNameCtrl.dispose();
    _parentNameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  void _showEnquiryDialog(PortalService service) {
    _studentNameCtrl.clear();
    _parentNameCtrl.clear();
    _phoneCtrl.clear();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.edit_note_rounded, color: AppTheme.primaryNavy),
              SizedBox(width: 10),
              Text('Walk-in Enquiry Form', style: TextStyle(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _studentNameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Applicant Name',
                    prefixIcon: Icon(Icons.face),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _parentNameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Parent/Guardian Name',
                    prefixIcon: Icon(Icons.supervisor_account),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Contact Number',
                    prefixIcon: Icon(Icons.phone),
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _selectedClass,
                  decoration: const InputDecoration(
                    labelText: 'Grade Seeking',
                    prefixIcon: Icon(Icons.grade),
                    border: OutlineInputBorder(),
                  ),
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
                      setState(() => _selectedClass = val);
                    }
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryNavy,
                foregroundColor: AppTheme.accentAmber,
              ),
              onPressed: () async {
                if (_studentNameCtrl.text.trim().isEmpty || _parentNameCtrl.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please satisfy applicant and parent details.')),
                  );
                  return;
                }
                await service.addAdmission(
                  _studentNameCtrl.text.trim(),
                  _parentNameCtrl.text.trim(),
                  _selectedClass,
                  _phoneCtrl.text.trim().isEmpty ? '+91-9999999999' : _phoneCtrl.text.trim(),
                  'Pending Review',
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Enquiry registered under active admissions desk.')),
                );
              },
              child: const Text('Register', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: AppTheme.accentAmber,
        onPressed: () => _showEnquiryDialog(service),
        child: const Icon(Icons.add_comment_rounded),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enrollment & Admissions',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryNavy,
              ),
            ),
            const Text(
              'Review student enquiries and verify applications. Approving an admission auto-enrolls them.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 12),

            // Admission summary cards
            Row(
              children: [
                Expanded(
                  child: Card(
                    color: Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        children: [
                          const Text('Pending Enquiries', style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text(
                            '${service.admissions.where((a) => a['status'] == 'Pending Review').length}',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.blue),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Card(
                    color: Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        children: [
                          const Text('Enrolled/Approved', style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text(
                            '${service.admissions.where((a) => a['status'] == 'Approved').length}',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.green),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            const Text(
              'Active Admission Inboxes',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
            ),
            const SizedBox(height: 8),

            // List of admissions
            Expanded(
              child: service.admissions.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.markunread_mailbox_outlined, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 8),
                          Text('No admissions records registered.', style: TextStyle(color: Colors.grey.shade600)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: service.admissions.length,
                      itemBuilder: (context, index) {
                        final a = service.admissions[index];
                        final isPending = a['status'] == 'Pending Review';
                        final isApproved = a['status'] == 'Approved';

                        Color badgeColor = Colors.orange.shade50;
                        Color textColor = Colors.orange;
                        if (isApproved) {
                          badgeColor = Colors.green.shade50;
                          textColor = Colors.green;
                        } else if (a['status'] == 'Rejected') {
                          badgeColor = Colors.red.shade50;
                          textColor = Colors.red;
                        }

                        return Card(
                          color: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      a['name'] ?? 'Applicant Name',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: badgeColor,
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        a['status'] ?? 'Pending',
                                        style: TextStyle(fontSize: 9, color: textColor, fontWeight: FontWeight.bold),
                                      ),
                                    )
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Parent: ${a['parentName']}  •  Class applied: ${a['classId']}',
                                  style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                ),
                                Text(
                                  'Contact Mobile: ${a['phone']}',
                                  style: TextStyle(fontSize: 10, color: Colors.grey.shade500),
                                ),
                                if (isPending) ...[
                                  const Divider(height: 16),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      OutlinedButton(
                                        style: OutlinedButton.styleFrom(
                                          foregroundColor: Colors.redAccent,
                                          side: const BorderSide(color: Colors.redAccent),
                                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                        ),
                                        onPressed: () async {
                                          await service.rejectAdmission(a['id']);
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(content: Text('Application for ${a['name']} declined.')),
                                          );
                                        },
                                        child: const Text('Decline Enrolment', style: TextStyle(fontSize: 11)),
                                      ),
                                      const SizedBox(width: 8),
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.green,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                        ),
                                        onPressed: () async {
                                          await service.approveAdmission(a['id']);
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(content: Text('Admission approved. ${a['name']} enrolled in class!')),
                                          );
                                        },
                                        child: const Text('Approve & Enroll', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                      )
                                    ],
                                  )
                                ]
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
