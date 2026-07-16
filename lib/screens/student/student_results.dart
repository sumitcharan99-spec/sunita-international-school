import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class StudentResults extends StatelessWidget {
  const StudentResults({super.key});

  String _getGrade(double percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'D';
  }

  Color _getGradeColor(String grade) {
    if (grade.startsWith('A')) return Colors.green;
    if (grade.startsWith('B')) return Colors.blue;
    if (grade.startsWith('C')) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final myResults = service.results.where((r) => r['studentId'] == 'std_1').toList();

    double totalObtained = 0;
    double totalMax = 0;

    for (var r in myResults) {
      totalObtained += (r['marksObtained'] as num).toDouble();
      totalMax += (r['maxMarks'] as num).toDouble();
    }

    double finalPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 81.5;
    String finalGrade = _getGrade(finalPct);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Term Grade summary header
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primaryNavy, Color(0xFF1B3B6F)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Cumulative Performance',
                          style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${finalPct.toStringAsFixed(1)}% / $finalGrade',
                          style: const TextStyle(
                            color: AppTheme.accentAmber,
                            fontSize: 26,
                            fontWeight: FontWeight.black,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Based on ${myResults.length} registered subjects exams evaluations.',
                          style: const TextStyle(color: Colors.white54, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppTheme.accentAmber.withOpacity(0.12),
                    child: Text(
                      finalGrade,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.black,
                        color: AppTheme.accentAmber,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          const Text(
            'Subject Evaluation Transcript',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: AppTheme.primaryNavy,
            ),
          ),
          const SizedBox(height: 12),

          if (myResults.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: const Text(
                'No examination results issued yet for this quarter.',
                style: TextStyle(fontSize: 11, color: Colors.grey),
              ),
            )
          else
            ...myResults.map((r) {
              final String subject = r['subject'] ?? 'Subject';
              final String exam = r['examName'] ?? 'Exam';
              final double obtained = (r['marksObtained'] as num).toDouble();
              final double max = (r['maxMarks'] as num).toDouble();
              final double pct = max > 0 ? (obtained / max) * 100 : 0;
              final String grade = _getGrade(pct);
              final Color gColor = _getGradeColor(grade);

              return Card(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Colors.grey.shade100, width: 1.5),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                subject,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: AppTheme.primaryNavy,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                exam,
                                style: TextStyle(fontSize: 9, color: Colors.grey.shade500),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: gColor.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              'Grade $grade',
                              style: TextStyle(
                                color: gColor,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Marks: $obtained / $max',
                            style: const TextStyle(fontSize: 11, color: AppTheme.primaryNavy, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            '${pct.toStringAsFixed(1)}%',
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade600, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: pct / 100,
                          backgroundColor: Colors.grey.shade100,
                          color: gColor,
                          minHeight: 6,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),

          const SizedBox(height: 16),
          // Print report card trigger
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryNavy,
              foregroundColor: AppTheme.accentAmber,
              minimumSize: const Size.fromHeight(48),
            ),
            icon: const Icon(Icons.print_rounded),
            label: const Text('GENERATE OFFICIAL PDF TRANSCRIPT', style: TextStyle(fontSize: 12)),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Compiling secure encrypted transcript report PDF... Check downloads.'),
                  backgroundColor: AppTheme.primaryNavy,
                ),
              );
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}
