import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class ParentTimetable extends StatefulWidget {
  const ParentTimetable({super.key});

  @override
  State<ParentTimetable> createState() => _ParentTimetableState();
}

class _ParentTimetableState extends State<ParentTimetable> with SingleTickerProviderStateMixin {
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

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final timetables = service.timetables;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'Class Timetable Schedule • Class 10A',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
              letterSpacing: 0.5,
            ),
          ),
        ),
        TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: AppTheme.primaryNavy,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppTheme.accentAmber,
          tabs: _days.map((day) => Tab(text: day)).toList(),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: _days.map((day) {
              final entries = timetables.where((t) => t['day'] == day).toList();

              if (entries.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.weekend_rounded, size: 48, color: Colors.grey.shade300),
                      const SizedBox(height: 12),
                      Text(
                        'No Scheduled Classes on $day',
                        style: TextStyle(color: Colors.grey.shade500, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: entries.length,
                itemBuilder: (context, idx) {
                  final entry = entries[idx];
                  final subject = entry['subject'] ?? 'Subject';
                  final period = entry['period'] ?? entry['startTime'] ?? 'Period';
                  final teacher = entry['teacher'] ?? 'Teacher';

                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.accentAmber.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.alarm_rounded, color: AppTheme.primaryNavy, size: 24),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  subject,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryNavy,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Instructor: $teacher',
                                  style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  period,
                                  style: const TextStyle(
                                    fontSize: 9,
                                    color: AppTheme.accentAmber,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right_rounded, color: Colors.grey),
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
