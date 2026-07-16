import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AdminHomework extends StatefulWidget {
  const AdminHomework({super.key});

  @override
  State<AdminHomework> createState() => _AdminHomeworkState();
}

class _AdminHomeworkState extends State<AdminHomework> {
  String _selectedClass = 'Class 10A';
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _dueDateCtrl = TextEditingController(text: '2026-07-25');
  String _selectedSubject = 'Mathematics';

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _dueDateCtrl.dispose();
    super.dispose();
  }

  void _showAddHomeworkDialog(PortalService service) {
    _titleCtrl.clear();
    _descCtrl.clear();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.edit_calendar_rounded, color: AppTheme.primaryNavy),
              SizedBox(width: 10),
              Text('Assign Class Homework', style: TextStyle(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold)),
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
                      setState(() => _selectedClass = val);
                    }
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _selectedSubject,
                  decoration: const InputDecoration(labelText: 'Subject', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'Mathematics', child: Text('Mathematics')),
                    DropdownMenuItem(value: 'Physics', child: Text('Physics')),
                    DropdownMenuItem(value: 'Chemistry', child: Text('Chemistry')),
                    DropdownMenuItem(value: 'English Lit', child: Text('English Lit')),
                    DropdownMenuItem(value: 'Computer Science', child: Text('Computer Science')),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _selectedSubject = val);
                    }
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _titleCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Homework Topic Title',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _descCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Guidelines / Read pages / Tasks',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _dueDateCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Submission Due Date (YYYY-MM-DD)',
                    border: OutlineInputBorder(),
                    suffixIcon: Icon(Icons.calendar_month),
                  ),
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
                if (_titleCtrl.text.trim().isEmpty || _descCtrl.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please satisfy homework title and description.')),
                  );
                  return;
                }
                await service.addHomework(
                  _selectedClass,
                  _selectedSubject,
                  _titleCtrl.text.trim(),
                  _descCtrl.text.trim(),
                  _dueDateCtrl.text,
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Homework assignment dispatched to class section successfully!')),
                );
              },
              child: const Text('Assign Homework', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    // Filter homeworks by selected class section
    final list = service.homeworks.where((hw) => hw['classId'] == _selectedClass).toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: AppTheme.accentAmber,
        onPressed: () => _showAddHomeworkDialog(service),
        child: const Icon(Icons.playlist_add_check_rounded),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Academic Assignment Board',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryNavy,
              ),
            ),
            const Text(
              'Publish, track, and monitor daily homework exercises and study logs assigned to classes.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 12),

            // Class selection filter bar
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
                    DropdownMenuItem(value: 'Class 9A', child: Text('Class 9A Homeworks')),
                    DropdownMenuItem(value: 'Class 10A', child: Text('Class 10A Homeworks')),
                    DropdownMenuItem(value: 'Class 10B', child: Text('Class 10B Homeworks')),
                    DropdownMenuItem(value: 'Class 10C', child: Text('Class 10C Homeworks')),
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

            // Homework card items
            Expanded(
              child: list.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.assignment_turned_in_outlined, size: 48, color: Colors.grey.shade300),
                          const SizedBox(height: 8),
                          Text('No active assignments found for this section.', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: list.length,
                      itemBuilder: (context, index) {
                        final hw = list[index];
                        return Card(
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
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primaryNavy.withOpacity(0.08),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        hw['subject'] ?? 'Subject',
                                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                                      ),
                                    ),
                                    Text(
                                      'Due: ${hw['dueDate']}',
                                      style: const TextStyle(fontSize: 10, color: Colors.redAccent, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  hw['title'] ?? 'Homework Assignment',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  hw['description'] ?? 'Guidelines...',
                                  style: const TextStyle(fontSize: 11, color: Colors.black54),
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
