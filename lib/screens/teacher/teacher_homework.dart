import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class TeacherHomework extends StatefulWidget {
  const TeacherHomework({super.key});

  @override
  State<TeacherHomework> createState() => _TeacherHomeworkState();
}

class _TeacherHomeworkState extends State<TeacherHomework> {
  final _homeworkTitleCtrl = TextEditingController();
  final _homeworkDescCtrl = TextEditingController();

  @override
  void dispose() {
    _homeworkTitleCtrl.dispose();
    _homeworkDescCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Assignment Homework Desk',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 12),

          Card(
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Assign Homework Task',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _homeworkTitleCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Topic Title (e.g. Quad Equations)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _homeworkDescCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Task Guidelines / Read Pages',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryNavy,
                      foregroundColor: AppTheme.accentAmber,
                      minimumSize: const Size.fromHeight(48),
                    ),
                    icon: const Icon(Icons.file_upload),
                    label: const Text('Publish & Notify Portal'),
                    onPressed: () {
                      if (_homeworkTitleCtrl.text.isEmpty || _homeworkDescCtrl.text.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please satisfy homework topic and guidelines.')),
                        );
                        return;
                      }
                      _homeworkTitleCtrl.clear();
                      _homeworkDescCtrl.clear();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Homework posted successfully!')),
                      );
                    },
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
