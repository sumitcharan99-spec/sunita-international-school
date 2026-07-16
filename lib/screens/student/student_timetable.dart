import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class StudentTimetable extends StatefulWidget {
  const StudentTimetable({super.key});

  @override
  State<StudentTimetable> createState() => _StudentTimetableState();
}

class _StudentTimetableState extends State<StudentTimetable> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _days.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Color _getSubjectColor(String subject) {
    final s = subject.toLowerCase();
    if (s.contains('math')) return Colors.blue;
    if (s.contains('physics') || s.contains('chem') || s.contains('science')) return Colors.teal;
    if (s.contains('eng')) return Colors.purple;
    if (s.contains('hist') || s.contains('social')) return Colors.orange;
    if (s.contains('computer') || s.contains('ict')) return Colors.indigo;
    return Colors.blueGrey;
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final allSlots = service.timetables.where((t) => t['classId'] == 'Class 10A').toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Class Timetable Planner',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryNavy,
                ),
              ),
              const Text(
                'Weekly class timetable roster for Class 10A',
                style: TextStyle(fontSize: 10, color: Colors.grey),
              ),
              const SizedBox(height: 12),
              TabBar(
                controller: _tabController,
                isScrollable: true,
                labelColor: AppTheme.primaryNavy,
                unselectedLabelColor: Colors.grey,
                indicatorColor: AppTheme.accentAmber,
                indicatorWeight: 3,
                tabs: _days.map((d) => Tab(text: d)).toList(),
              ),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: _days.map((day) {
              final daySlots = allSlots.where((s) => s['day'] == day).toList();

              if (daySlots.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.event_busy, color: Colors.grey.shade400, size: 40),
                      const SizedBox(height: 8),
                      const Text(
                        'No Classes Scheduled',
                        style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryNavy, fontSize: 13),
                      ),
                      const Text(
                        'Enjoy your academic self-study break!',
                        style: TextStyle(fontSize: 10, color: Colors.grey),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: daySlots.length,
                itemBuilder: (context, index) {
                  final slot = daySlots[index];
                  final String subject = slot['subject'] ?? 'Subject';
                  final String period = slot['period'] ?? 'Period';
                  final String teacher = slot['teacher'] ?? 'Faculty';
                  final Color sCol = _getSubjectColor(subject);

                  return Card(
                    color: Colors.white,
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(color: Colors.grey.shade100, width: 1.5),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          // Left color indicator matching subject
                          Container(
                            width: 6,
                            height: 48,
                            decoration: BoxDecoration(
                              color: sCol,
                              borderRadius: BorderRadius.circular(3),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  period,
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.grey.shade500,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  subject,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                    color: AppTheme.primaryNavy,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Instructor: $teacher',
                                  style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.arrow_forward_ios_rounded, color: Colors.grey.shade300, size: 14),
                        ],
                      ),
                    ),
                  );
                },
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}
