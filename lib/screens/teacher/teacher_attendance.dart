import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class TeacherAttendance extends StatefulWidget {
  const TeacherAttendance({super.key});

  @override
  State<TeacherAttendance> createState() => _TeacherAttendanceState();
}

class _TeacherAttendanceState extends State<TeacherAttendance> {
  // Simple map to track state locally in widget before dispatch
  final Map<String, bool> _attendanceRegistry = {};

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    // Populate default registry state
    for (var s in service.students) {
      _attendanceRegistry.putIfAbsent(s.id, () => true);
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Daily Attendance Logging (Class 10A)',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          const Text(
            'Tick absent students and dispatch digital register logs securely',
            style: TextStyle(fontSize: 10, color: Colors.grey),
          ),
          const SizedBox(height: 12),

          Card(
            color: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: service.students.length,
                separatorBuilder: (_, __) => const Divider(),
                itemBuilder: (context, idx) {
                  final s = service.students[idx];
                  final isPresent = _attendanceRegistry[s.id] ?? true;

                  return Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: AppTheme.primaryNavy.withOpacity(0.1),
                            maxRadius: 16,
                            child: Text(
                              s.rollNo,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryNavy,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            s.name,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Text(
                            isPresent ? 'Present' : 'Absent',
                            style: TextStyle(
                              fontSize: 10,
                              color: isPresent ? Colors.green : Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Switch(
                            value: isPresent,
                            activeColor: Colors.green,
                            inactiveThumbColor: Colors.red,
                            onChanged: (val) {
                              setState(() {
                                _attendanceRegistry[s.id] = val;
                              });
                              service.adjustAttendance(s.id);
                            },
                          ),
                        ],
                      )
                    ],
                  );
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryNavy,
              foregroundColor: AppTheme.accentAmber,
              minimumSize: const Size.fromHeight(48),
            ),
            icon: const Icon(Icons.cloud_done_rounded),
            label: const Text(
              'DISPATCH ATTENDANCE REGISTER',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Attendance registered and parental SMS logs executed.'),
                ),
              );
            },
          )
        ],
      ),
    );
  }
}
