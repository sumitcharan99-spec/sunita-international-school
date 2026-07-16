import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AdminTimetable extends StatefulWidget {
  const AdminTimetable({super.key});

  @override
  State<AdminTimetable> createState() => _AdminTimetableState();
}

class _AdminTimetableState extends State<AdminTimetable> {
  String _selectedClass = 'Class 10A';
  String _selectedDay = 'Monday';
  String _selectedPeriod = 'Period 1 (08:30 AM)';
  String _selectedSubject = 'Mathematics';
  String _selectedTeacher = 'Mr. Arvind Verma';

  final List<String> _days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  final List<String> _periods = [
    'Period 1 (08:30 AM)',
    'Period 2 (09:30 AM)',
    'Period 3 (10:45 AM)',
    'Period 4 (11:45 AM)',
    'Period 5 (01:30 PM)',
    'Period 6 (02:30 PM)'
  ];

  void _showAddTimetableDialog(PortalService service) {
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Row(
                children: [
                  Icon(Icons.schedule_rounded, color: AppTheme.primaryNavy),
                  SizedBox(width: 10),
                  Text('Schedule Period Slot', style: TextStyle(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold)),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<String>(
                      value: _selectedClass,
                      decoration: const InputDecoration(labelText: 'Class Section', border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: 'Class 9A', child: Text('Class 9A')),
                        DropdownMenuItem(value: 'Class 10A', child: Text('Class 10A')),
                        DropdownMenuItem(value: 'Class 10B', child: Text('Class 10B')),
                        DropdownMenuItem(value: 'Class 10C', child: Text('Class 10C')),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() => _selectedClass = val);
                        }
                      },
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      value: _selectedDay,
                      decoration: const InputDecoration(labelText: 'Weekday Day', border: OutlineInputBorder()),
                      items: _days.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() => _selectedDay = val);
                        }
                      },
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      value: _selectedPeriod,
                      decoration: const InputDecoration(labelText: 'Period Timing', border: OutlineInputBorder()),
                      items: _periods.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() => _selectedPeriod = val);
                        }
                      },
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      value: _selectedSubject,
                      decoration: const InputDecoration(labelText: 'Assigned Subject', border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: 'Mathematics', child: Text('Mathematics')),
                        DropdownMenuItem(value: 'Physics', child: Text('Physics')),
                        DropdownMenuItem(value: 'Chemistry', child: Text('Chemistry')),
                        DropdownMenuItem(value: 'Biology', child: Text('Biology')),
                        DropdownMenuItem(value: 'English Lit', child: Text('English Lit')),
                        DropdownMenuItem(value: 'Computer Science', child: Text('Computer Science')),
                        DropdownMenuItem(value: 'Social Studies', child: Text('Social Studies')),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() => _selectedSubject = val);
                        }
                      },
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      value: _selectedTeacher,
                      decoration: const InputDecoration(labelText: 'Faculty Mentor', border: OutlineInputBorder()),
                      items: service.teachers.isNotEmpty
                          ? service.teachers.map<DropdownMenuItem<String>>((t) {
                              final name = t['name']?.toString() ?? 'Faculty';
                              return DropdownMenuItem<String>(value: name, child: Text(name));
                            }).toList()
                          : const [DropdownMenuItem(value: 'Mr. Arvind Verma', child: Text('Mr. Arvind Verma'))],
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() => _selectedTeacher = val);
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
                    await service.addTimetableEntry(
                      _selectedClass,
                      _selectedDay,
                      _selectedPeriod,
                      _selectedSubject,
                      _selectedTeacher,
                    );
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Period scheduled on calendar successfully!')),
                    );
                  },
                  child: const Text('Schedule Slot', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    // Filter timetables by selected class
    final classTimetable = service.timetables.where((t) => t['classId'] == _selectedClass).toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: AppTheme.accentAmber,
        onPressed: () => _showAddTimetableDialog(service),
        child: const Icon(Icons.add_alarm_rounded),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Weekly Academic Timetables',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryNavy,
              ),
            ),
            const Text(
              'Map daily study rosters, assign faculty periods, and streamline daily rosters.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 12),

            // Select Class Filter Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedClass,
                  isExpanded: true,
                  style: const TextStyle(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold),
                  items: const [
                    DropdownMenuItem(value: 'Class 9A', child: Text('Class 9A Timetable')),
                    DropdownMenuItem(value: 'Class 10A', child: Text('Class 10A Timetable')),
                    DropdownMenuItem(value: 'Class 10B', child: Text('Class 10B Timetable')),
                    DropdownMenuItem(value: 'Class 10C', child: Text('Class 10C Timetable')),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _selectedClass = val);
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Tab-style weekdays filter
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _days.map((day) {
                  final isSel = _selectedDay == day;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6.0),
                    child: ChoiceChip(
                      label: Text(day),
                      selected: isSel,
                      selectedColor: AppTheme.primaryNavy,
                      labelStyle: TextStyle(
                        color: isSel ? AppTheme.accentAmber : Colors.black87,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                      onSelected: (val) {
                        if (val) {
                          setState(() => _selectedDay = day);
                        }
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 12),

            // Timetable list for selected day and class
            Expanded(
              child: (() {
                final dayEntries = classTimetable.where((t) => t['day'] == _selectedDay).toList();

                // Sort entries by period index to make it orderly
                dayEntries.sort((a, b) {
                  final ap = a['period']?.toString() ?? '';
                  final bp = b['period']?.toString() ?? '';
                  return ap.compareTo(bp);
                });

                if (dayEntries.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.calendar_today_outlined, size: 48, color: Colors.grey.shade300),
                        const SizedBox(height: 8),
                        Text('No lecture periods scheduled for $_selectedDay.', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: dayEntries.length,
                  itemBuilder: (context, index) {
                    final t = dayEntries[index];
                    return Card(
                      color: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryNavy.withOpacity(0.06),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.class_outlined, color: AppTheme.primaryNavy, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    t['period'] ?? 'Period Slot',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.blue),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    t['subject'] ?? 'Subject',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
                                  ),
                                  const SizedBox(height: 2),
                                  Row(
                                    children: [
                                      const Icon(Icons.person, size: 10, color: Colors.grey),
                                      const SizedBox(width: 4),
                                      Text(
                                        t['teacher'] ?? 'Faculty Mentor',
                                        style: const TextStyle(fontSize: 10, color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.cancel_outlined, color: Colors.redAccent, size: 18),
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (context) {
                                    return AlertDialog(
                                      title: const Text('Delete Slot?'),
                                      content: const Text('Remove this period slot from the class schedule?'),
                                      actions: [
                                        TextButton(
                                          onPressed: () => Navigator.pop(context),
                                          child: const Text('Cancel'),
                                        ),
                                        TextButton(
                                          onPressed: () async {
                                            await service.deleteTimetableEntry(t['id']);
                                            Navigator.pop(context);
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(content: Text('Period slot deleted.')),
                                            );
                                          },
                                          child: const Text('Delete', style: TextStyle(color: Colors.red)),
                                        ),
                                      ],
                                    );
                                  },
                                );
                              },
                            )
                          ],
                        ),
                      ),
                    );
                  },
                );
              })(),
            ),
          ],
        ),
      ),
    );
  }
}
