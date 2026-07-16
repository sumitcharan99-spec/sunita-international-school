import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AdminResults extends StatefulWidget {
  const AdminResults({super.key});

  @override
  State<AdminResults> createState() => _AdminResultsState();
}

class _AdminResultsState extends State<AdminResults> {
  String _selectedStudentId = 'std_1';
  String _selectedSubject = 'Mathematics';
  String _selectedExamName = 'First Term Assessment';
  final _marksCtrl = TextEditingController(text: '85');
  final _maxMarksCtrl = TextEditingController(text: '100');

  @override
  void dispose() {
    _marksCtrl.dispose();
    _maxMarksCtrl.dispose();
    super.dispose();
  }

  void _showAddResultDialog(PortalService service) {
    if (service.students.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enroll students first before creating exam grade sheets.')),
      );
      return;
    }
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Row(
                children: [
                  Icon(Icons.grade_rounded, color: AppTheme.primaryNavy),
                  SizedBox(width: 10),
                  Text('Record Student Grades', style: TextStyle(color: AppTheme.primaryNavy, fontWeight: FontWeight.bold)),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<String>(
                      value: _selectedStudentId,
                      decoration: const InputDecoration(labelText: 'Select Student', border: OutlineInputBorder()),
                      items: service.students
                          .map((s) => DropdownMenuItem(value: s.id, child: Text('${s.name} (${s.classId})')))
                          .toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() => _selectedStudentId = val);
                        }
                      },
                    ),
                    const SizedBox(height: 10),
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
                          setDialogState(() => _selectedSubject = val);
                        }
                      },
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      value: _selectedExamName,
                      decoration: const InputDecoration(labelText: 'Examination Cycle', border: OutlineInputBorder()),
                      items: const [
                        DropdownMenuItem(value: 'Unit Test 1', child: Text('Unit Test 1')),
                        DropdownMenuItem(value: 'Unit Test 2', child: Text('Unit Test 2')),
                        DropdownMenuItem(value: 'First Term Assessment', child: Text('First Term Assessment')),
                        DropdownMenuItem(value: 'Final Semester Examinations', child: Text('Final Semester Examinations')),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setDialogState(() => _selectedExamName = val);
                        }
                      },
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _marksCtrl,
                            decoration: const InputDecoration(labelText: 'Marks Obtained', border: OutlineInputBorder()),
                            keyboardType: TextInputType.number,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _maxMarksCtrl,
                            decoration: const InputDecoration(labelText: 'Max Marks', border: OutlineInputBorder()),
                            keyboardType: TextInputType.number,
                          ),
                        ),
                      ],
                    )
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
                    final marks = double.tryParse(_marksCtrl.text) ?? 80.0;
                    final maxMarks = double.tryParse(_maxMarksCtrl.text) ?? 100.0;
                    final student = service.students.firstWhere((s) => s.id == _selectedStudentId);

                    await service.addResult(
                      student.id,
                      student.name,
                      student.classId,
                      _selectedSubject,
                      _selectedExamName,
                      marks,
                      maxMarks,
                    );
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Grades published & parents notified on companion application!')),
                    );
                  },
                  child: const Text('Publish Grades', style: TextStyle(fontWeight: FontWeight.bold)),
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

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primaryNavy,
        foregroundColor: AppTheme.accentAmber,
        onPressed: () => _showAddResultDialog(service),
        child: const Icon(Icons.spellcheck_rounded),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Academic Grades & Reports Card Engine',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryNavy,
              ),
            ),
            const Text(
              'Publish quarterly assessment scores, analyze student report cards, and dispatch transcripts.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 12),

            // Average score overview bento box
            Card(
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.teal.shade50,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.analytics, color: Colors.teal, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Class Average Grade', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy)),
                          const SizedBox(height: 2),
                          Text(
                            'Overall Passing: 83.4% • Published transcripts: ${service.results.length}',
                            style: const TextStyle(fontSize: 10, color: Colors.blueGrey),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            const Text(
              'Transcripts Log',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
            ),
            const SizedBox(height: 8),

            // List of published marks
            Expanded(
              child: service.results.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.assessment_outlined, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 8),
                          Text('No results transcript published yet.', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: service.results.length,
                      itemBuilder: (context, index) {
                        final res = service.results[index];
                        final score = (res['marksObtained'] as num).toDouble();
                        final total = (res['maxMarks'] as num).toDouble();
                        final double percentage = total > 0 ? (score / total) * 100 : 0;

                        Color scoreColor = Colors.green;
                        if (percentage < 40) {
                          scoreColor = Colors.red;
                        } else if (percentage < 75) {
                          scoreColor = Colors.orange;
                        }

                        return Card(
                          color: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: scoreColor.withOpacity(0.08),
                              child: Text(
                                '${percentage.toStringAsFixed(0)}%',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: scoreColor),
                              ),
                            ),
                            title: Text(
                              res['studentName'] ?? 'Rahul Sharma',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${res['subject']} • ${res['examName']}',
                                  style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
                                ),
                                Text(
                                  'Section: ${res['classId']}',
                                  style: const TextStyle(fontSize: 9, color: Colors.grey),
                                ),
                              ],
                            ),
                            trailing: Text(
                              '${score.toStringAsFixed(0)} / ${total.toStringAsFixed(0)}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
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
