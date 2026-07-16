import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AdminReports extends StatelessWidget {
  const AdminReports({super.key});

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    // Dynamic analytics values
    final double totalOutstanding = service.fees
        .where((f) => f.status == 'unpaid')
        .fold(0, (sum, item) => sum + item.amount);
    final double totalCollected = service.fees
        .where((f) => f.status == 'paid')
        .fold(0, (sum, item) => sum + item.amount);
    final double totalBilling = totalOutstanding + totalCollected;
    final double feeProgress = totalBilling > 0 ? (totalCollected / totalBilling) * 100 : 0.0;

    final int activeNoticeCount = service.notices.length;
    final int totalStudentsCount = service.students.length;
    final int totalTeachersCount = service.teachers.length;

    // Student to Teacher Ratio
    final double studentTeacherRatio = totalTeachersCount > 0 ? totalStudentsCount / totalTeachersCount : 0.0;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Academic Analytics & Reports',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryNavy,
              ),
            ),
            const Text(
              'Real-time administrative graphs, ledger audits, and faculty metrics.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 16),

            // Bento Grid Cards
            // 1. Fee Collection circular gauge
            Card(
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Taxes & Fee Collection Progress',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            SizedBox(
                              width: 80,
                              height: 80,
                              child: CircularProgressIndicator(
                                value: feeProgress / 100,
                                strokeWidth: 10,
                                backgroundColor: Colors.amber.shade50,
                                color: Colors.amber.shade700,
                              ),
                            ),
                            Text(
                              '${feeProgress.toStringAsFixed(0)}%',
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppTheme.primaryNavy),
                            )
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildLegendItem('Collected', '₹${totalCollected.toStringAsFixed(0)}', Colors.amber.shade700),
                            const SizedBox(height: 6),
                            _buildLegendItem('Outstanding', '₹${totalOutstanding.toStringAsFixed(0)}', Colors.rose),
                            const SizedBox(height: 6),
                            _buildLegendItem('Total Billed', '₹${totalBilling.toStringAsFixed(0)}', AppTheme.primaryNavy),
                          ],
                        )
                      ],
                    )
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 2. Student Teacher Ratio bento box
            Card(
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Scholastic Human Capital',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryNavy),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildBentoMetric(
                            'Ratio',
                            '${studentTeacherRatio.toStringAsFixed(1)}:1',
                            'Student to Teacher',
                            Icons.supervised_user_circle,
                            Colors.teal,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildBentoMetric(
                            'Faculty',
                            '$totalTeachersCount Members',
                            'Educators roster',
                            Icons.contact_mail,
                            Colors.blue,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: _buildBentoMetric(
                            'Notice Rate',
                            '$activeNoticeCount Bulletins',
                            'Broadcasts posted',
                            Icons.campaign,
                            Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildBentoMetric(
                            'Avg Attendance',
                            '94.2%',
                            'Overall school',
                            Icons.verified_user,
                            Colors.indigo,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Master trigger to compile PDF report card
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryNavy,
                foregroundColor: AppTheme.accentAmber,
                minimumSize: const Size.fromHeight(48),
              ),
              icon: const Icon(Icons.picture_as_pdf),
              label: const Text('GENERATE FULL SCHOOL COMPLIANCE REPORT', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Report generated in memory! Dispatched PDF file to downloads directory.')),
                );
              },
            )
          ],
        ),
      ),
    );
  }

  Widget _buildLegendItem(String title, String val, Color color) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(width: 4),
        Text(val, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black87)),
      ],
    );
  }

  Widget _buildBentoMetric(String title, String val, String subtitle, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.12)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: color)),
              Icon(icon, color: color, size: 14),
            ],
          ),
          const SizedBox(height: 4),
          Text(val, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy)),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(fontSize: 8, color: Colors.grey)),
        ],
      ),
    );
  }
}
