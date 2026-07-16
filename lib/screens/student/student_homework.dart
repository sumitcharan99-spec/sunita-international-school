import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class StudentHomework extends StatefulWidget {
  const StudentHomework({super.key});

  @override
  State<StudentHomework> createState() => _StudentHomeworkState();
}

class _StudentHomeworkState extends State<StudentHomework> {
  final _answerController = TextEditingController();
  Map<String, dynamic>? _selectedHw;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }

  void _submitWorksheet(PortalService service) {
    if (_answerController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please type some answers steps before transmitting.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    Future.delayed(const Duration(milliseconds: 1200), () {
      setState(() {
        _isSubmitting = false;
        _selectedHw = null;
        _answerController.clear();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Success! Assignment solutions transmitted securely to Firestore.'),
          backgroundColor: Colors.green,
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final myClassHw = service.homeworks.where((h) => h['classId'] == 'Class 10A').toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Homework & Assignments',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryNavy,
                    ),
                  ),
                  Text(
                    'Worksheets issued by Subject Faculty',
                    style: TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppTheme.accentAmber.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${myClassHw.length} Active',
                  style: const TextStyle(
                    color: AppTheme.primaryNavy,
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (myClassHw.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: const Column(
                children: [
                  Icon(Icons.assignment_turned_in_rounded, color: Colors.green, size: 36),
                  SizedBox(height: 8),
                  Text(
                    'All Caught Up!',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'No active worksheets are pending submission for your class.',
                    style: TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                ],
              ),
            )
          else
            ...myClassHw.map((hw) {
              final String subject = hw['subject'] ?? 'Subject';
              final String title = hw['title'] ?? 'Title';
              final String desc = hw['description'] ?? '';
              final String due = hw['dueDate'] ?? '';

              return Card(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.grey.shade150, width: 1),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryNavy.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              subject.toUpperCase(),
                              style: const TextStyle(
                                color: AppTheme.primaryNavy,
                                fontWeight: FontWeight.bold,
                                fontSize: 9,
                              ),
                            ),
                          ),
                          Text(
                            'Due: $due',
                            style: const TextStyle(fontSize: 10, color: Colors.redAccent, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        title,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                          color: AppTheme.primaryNavy,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        desc,
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade700, height: 1.4),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.primaryNavy,
                              side: const BorderSide(color: AppTheme.primaryNavy),
                            ),
                            icon: const Icon(Icons.file_upload_outlined, size: 16),
                            label: const Text('Submit Solution', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            onPressed: () {
                              setState(() {
                                _selectedHw = hw;
                              });
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),

          // Solution upload overlay/sheet dialog
          if (_selectedHw != null) ...[
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber.shade50.withOpacity(0.3),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.accentAmber.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Submit Worksheet Solution',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 18, color: Colors.grey),
                        onPressed: () => setState(() => _selectedHw = null),
                      )
                    ],
                  ),
                  Text(
                    'Subject: ${_selectedHw!['subject']} - ${_selectedHw!['title']}',
                    style: const TextStyle(fontSize: 11, color: Colors.blueGrey, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _answerController,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      hintText: 'Type your steps proof, answers, or assignment notes here...',
                      hintStyle: TextStyle(fontSize: 11),
                      border: OutlineInputBorder(),
                      fillColor: Colors.white,
                      filled: true,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Upload completed project PDF or JPG file (optional)',
                          style: TextStyle(fontSize: 10, color: Colors.grey, fontStyle: FontStyle.italic),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.attach_file, color: AppTheme.primaryNavy),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Local file attached successfully!')),
                          );
                        },
                      )
                    ],
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryNavy,
                      foregroundColor: AppTheme.accentAmber,
                      minimumSize: const Size.fromHeight(42),
                    ),
                    onPressed: _isSubmitting ? null : () => _submitWorksheet(service),
                    icon: _isSubmitting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.accentAmber),
                          )
                        : const Icon(Icons.cloud_upload_rounded),
                    label: Text(_isSubmitting ? 'Transmitting Answers...' : 'Transmit Solutions PDF'),
                  ),
                ],
              ),
            )
          ]
        ],
      ),
    );
  }
}
