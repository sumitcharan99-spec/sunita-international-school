import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class AdminDashboard extends StatelessWidget {
  final Function(int)? onNavigate;

  const AdminDashboard({super.key, this.onNavigate});

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);

    final double totalOutstanding = service.fees
        .where((f) => f.status == 'unpaid')
        .fold(0, (sum, item) => sum + item.amount);
    final int unpaidCount = service.fees.where((f) => f.status == 'unpaid').length;
    final int pendingAdmissions = service.admissions.where((a) => a['status'] == 'Pending Review').length;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.primaryNavy.withOpacity(0.08),
                  radius: 24,
                  child: const Icon(Icons.account_balance_rounded, color: AppTheme.primaryNavy, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Principal Administration Desk',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.blueGrey,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        service.settings['institutionName'] ?? 'Sunita International School',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryNavy,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Main stats showcase banner
            Card(
              color: AppTheme.primaryNavy,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Academic Year Live',
                            style: TextStyle(color: AppTheme.accentAmber, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Term: ${service.settings['academicYear'] ?? '2026-2027'}',
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'All operations are fully synced with central secure Firestore servers. Manage students, fee accounts, and class events below.',
                            style: TextStyle(color: Colors.white70, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Icon(Icons.auto_awesome, color: AppTheme.accentAmber, size: 36),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Interactive Hub Modules',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primaryNavy),
            ),
            const Text(
              'Tap on any bento-card module below to open the dedicated control workspace.',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 12),

            // Bento Grid of all requested modules
            GridView.count(
              crossAxisCount: MediaQuery.of(context).size.width > 700 ? 3 : 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.15,
              children: [
                _buildBentoItem(
                  title: 'Student Directory',
                  count: '${service.students.length} Registered',
                  icon: Icons.people_alt_rounded,
                  color: Colors.indigo,
                  onTap: () => onNavigate?.call(1),
                ),
                _buildBentoItem(
                  title: 'Faculty / Teachers',
                  count: '${service.teachers.length} Active',
                  icon: Icons.assignment_ind_rounded,
                  color: Colors.teal,
                  onTap: () => onNavigate?.call(2),
                ),
                _buildBentoItem(
                  title: 'Admissions Desk',
                  count: '$pendingAdmissions Pending Review',
                  icon: Icons.school_rounded,
                  color: Colors.amber.shade800,
                  onTap: () => onNavigate?.call(3),
                ),
                _buildBentoItem(
                  title: 'Fees & Invoices',
                  count: '₹${totalOutstanding.toStringAsFixed(0)} Due',
                  icon: Icons.credit_card,
                  color: Colors.redAccent,
                  onTap: () => onNavigate?.call(4),
                ),
                _buildBentoItem(
                  title: 'Attendance Deck',
                  count: '94.2% Average',
                  icon: Icons.done_all,
                  color: Colors.deepPurple,
                  onTap: () => onNavigate?.call(5),
                ),
                _buildBentoItem(
                  title: 'Timetable Planner',
                  count: '${service.timetables.length} Period Slots',
                  icon: Icons.calendar_month,
                  color: Colors.blue,
                  onTap: () => onNavigate?.call(6),
                ),
                _buildBentoItem(
                  title: 'Homework Board',
                  count: '${service.homeworks.length} Assigned',
                  icon: Icons.menu_book,
                  color: Colors.orange,
                  onTap: () => onNavigate?.call(7),
                ),
                _buildBentoItem(
                  title: 'Report Cards / Results',
                  count: '${service.results.length} Published',
                  icon: Icons.grade,
                  color: Colors.purple,
                  onTap: () => onNavigate?.call(8),
                ),
                _buildBentoItem(
                  title: 'Notices / Bulletins',
                  count: '${service.notices.length} Broadcasted',
                  icon: Icons.campaign_rounded,
                  color: Colors.blueGrey,
                  onTap: () => onNavigate?.call(9),
                ),
                _buildBentoItem(
                  title: 'Memories Gallery',
                  count: '${service.galleryImages.length} High-res photos',
                  icon: Icons.photo_library_outlined,
                  color: Colors.pink,
                  onTap: () => onNavigate?.call(10),
                ),
                _buildBentoItem(
                  title: 'Analytical Reports',
                  count: '3 Master sheets',
                  icon: Icons.analytics,
                  color: Colors.brown,
                  onTap: () => onNavigate?.call(11),
                ),
                _buildBentoItem(
                  title: 'General Settings',
                  count: '6 Properties configured',
                  icon: Icons.settings,
                  color: Colors.blueAccent,
                  onTap: () => onNavigate?.call(12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBentoItem({
    required String title,
    required String count,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade100, width: 1.5),
      ),
      elevation: 0,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                      color: AppTheme.primaryNavy,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    count,
                    style: TextStyle(
                      fontSize: 9,
                      color: Colors.grey.shade600,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
