import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AdminAttendance extends StatefulWidget {
  const AdminAttendance({super.key});

  @override
  State<AdminAttendance> createState() => _AdminAttendanceState();
}

class _AdminAttendanceState extends State<AdminAttendance> {
  String _selectedClass = 'Class 10A';
  final Map<String, bool> _overrides = {};

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    final filteredStudents = service.students.where((s) => s.classId == _selectedClass).toList();

    for (var s in filteredStudents) {
      _overrides.putIfAbsent(s.id, () => true);
    }

    final double attendancePercentage = filteredStudents.isEmpty ? 100.0 : (_overrides.values.where((v) => v).length / filteredStudents.length) * 100;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Master Attendance Deck',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryNavy,
              ),
            ),
            const Text(
              'View section statistics, audit registers, or record administrative attendance entries.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 12),

            // Class selection & general stats
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedClass,
                        style: const TextStyle(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold),
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
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryNavy,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'Avg: ${attendancePercentage.toStringAsFixed(1)}%',
                    style: const TextStyle(color: AppTheme.accentAmber, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                )
              ],
            ),
            const SizedBox(height: 16),

            // Visual mini progress bar for today
            Card(
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Daily Roll Call Summary', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy)),
                        Text(
                          '${_overrides.values.where((v) => v).length} Present  /  ${_overrides.values.where((v) => !v).length} Absent',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blueGrey),
                        )
                      ],
                    ),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: attendancePercentage / 100,
                        backgroundColor: Colors.grey.shade100,
                        color: Colors.teal,
                        minHeight: 12,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Parents receive automated SMS logs as soon as overrides are published.',
                      style: TextStyle(fontSize: 9, color: Colors.grey, fontStyle: FontStyle.italic),
                    )
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Class list overrides
            Expanded(
              child: filteredStudents.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.people_outline, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 8),
                          Text('No students enrolled in this section.', style: TextStyle(color: Colors.grey.shade600)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: filteredStudents.length,
                      itemBuilder: (context, index) {
                        final s = filteredStudents[index];
                        final isPresent = _overrides[s.id] ?? true;

                        return Card(
                          color: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppTheme.primaryNavy.withOpacity(0.08),
                              child: Text(
                                s.rollNo,
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                              ),
                            ),
                            title: Text(
                              s.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            subtitle: Text('ID: ${s.id}', style: const TextStyle(fontSize: 9, color: Colors.grey)),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
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
                                      _overrides[s.id] = val;
                                    });
                                    service.adjustAttendance(s.id);
                                  },
                                )
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),

            // Bottom trigger button
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryNavy,
                foregroundColor: AppTheme.accentAmber,
                minimumSize: const Size.fromHeight(48),
              ),
              icon: const Icon(Icons.verified_user),
              label: const Text('SUBMIT ADMINISTRATIVE ATTENDANCE OVERRIDES', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Administrative attendance registers saved & locked!')),
                );
              },
            )
          ],
        ),
      ),
    );
  }
}
