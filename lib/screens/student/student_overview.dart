import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class StudentOverview extends StatelessWidget {
  final Function(int)? onNavigate;

  const StudentOverview({super.key, this.onNavigate});

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final user = service.currentUserProfile;
    final String name = user?.name ?? 'Rahul Sharma';
    final String classId = user?.classId ?? 'Class 10A';
    final String rollNo = user?.rollNo ?? '24';

    // Computed totals
    final myUnpaidFees = service.fees.where((f) => f.studentId == 'std_1' && f.status == 'unpaid').toList();
    final homeworkCount = service.homeworks.where((h) => h['classId'] == 'Class 10A').length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Spectacular Welcome Header Card
          Card(
            clipBehavior: Clip.antiAlias,
            elevation: 3,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.primaryNavy, Color(0xFF134074)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Stack(
                children: [
                  Positioned(
                    right: -20,
                    bottom: -20,
                    child: Icon(
                      Icons.school_rounded,
                      size: 110,
                      color: AppTheme.accentAmber.withOpacity(0.08),
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Namaste, $name',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.black,
                                    color: Colors.white,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Sunita International School • Class $classId',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppTheme.accentAmber,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Chip(
                            label: Text(
                              'Roll: $rollNo',
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryNavy,
                              ),
                            ),
                            backgroundColor: AppTheme.accentAmber,
                            padding: EdgeInsets.zero,
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Welcome to your digital academic desk workspace. Review active worksheets, outstanding fees ledgers, and institutional circulars below.',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 10,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Overview Statistics Horizontal Row
          Row(
            children: [
              _buildStatBox(
                context,
                title: 'ATTENDANCE',
                value: '94.8%',
                color: Colors.green,
                icon: Icons.calendar_today_rounded,
                onTap: () => onNavigate?.call(2),
              ),
              const SizedBox(width: 8),
              _buildStatBox(
                context,
                title: 'RESULTS',
                value: 'A+ Grade',
                color: Colors.blue,
                icon: Icons.grade_rounded,
                onTap: () => onNavigate?.call(5),
              ),
              const SizedBox(width: 8),
              _buildStatBox(
                context,
                title: 'PENDING HW',
                value: '$homeworkCount Tasks',
                color: Colors.orange,
                icon: Icons.assignment_rounded,
                onTap: () => onNavigate?.call(3),
              ),
              const SizedBox(width: 8),
              _buildStatBox(
                context,
                title: 'FEES DUE',
                value: myUnpaidFees.isEmpty ? 'Settled' : '₹14,500',
                color: myUnpaidFees.isEmpty ? Colors.green : Colors.red,
                icon: Icons.credit_card_rounded,
                onTap: () => onNavigate?.call(6),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Actions grid menu (Bento-inspired card layouts)
          const Text(
            'Academic Workspace Portals',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
              color: AppTheme.primaryNavy,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 12),

          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 2.1,
            children: [
              _buildPortalMenuCard(
                icon: Icons.account_circle_rounded,
                label: 'Student Profile',
                sub: 'ID Card & Info',
                color: Colors.indigo,
                onTap: () => onNavigate?.call(1),
              ),
              _buildPortalMenuCard(
                icon: Icons.done_all_rounded,
                label: 'Attendance logs',
                sub: 'Daily registry',
                color: Colors.green,
                onTap: () => onNavigate?.call(2),
              ),
              _buildPortalMenuCard(
                icon: Icons.assignment_rounded,
                label: 'Homework Desk',
                sub: 'Worksheets submission',
                color: Colors.orange,
                onTap: () => onNavigate?.call(3),
              ),
              _buildPortalMenuCard(
                icon: Icons.calendar_today_rounded,
                label: 'Class Timetable',
                sub: 'Weekly scheduler',
                color: Colors.purple,
                onTap: () => onNavigate?.call(4),
              ),
              _buildPortalMenuCard(
                icon: Icons.grade_rounded,
                label: 'Exam Results',
                sub: 'Report transcripts',
                color: Colors.blue,
                onTap: () => onNavigate?.call(5),
              ),
              _buildPortalMenuCard(
                icon: Icons.credit_card_rounded,
                label: 'Fee Status',
                sub: 'Ledgers & Receipts',
                color: Colors.teal,
                onTap: () => onNavigate?.call(6),
              ),
              _buildPortalMenuCard(
                icon: Icons.campaign_rounded,
                label: 'Bulletins Board',
                sub: 'Circular Notices',
                color: Colors.redAccent,
                onTap: () => onNavigate?.call(7),
              ),
              _buildPortalMenuCard(
                icon: Icons.photo_library_rounded,
                label: 'School Gallery',
                sub: 'Events Memories',
                color: Colors.amber.shade800,
                onTap: () => onNavigate?.call(8),
              ),
              _buildPortalMenuCard(
                icon: Icons.event_available_rounded,
                label: 'Holidays Calendar',
                sub: 'Scheduled activities',
                color: Colors.cyan.shade700,
                onTap: () => onNavigate?.call(9),
              ),
              _buildPortalMenuCard(
                icon: Icons.download_rounded,
                label: 'Downloads Deck',
                sub: 'Syllabi & Manuals',
                color: Colors.blueGrey,
                onTap: () => onNavigate?.call(10),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Notices Bulletin Board
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Notice Circular Bulletins',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: AppTheme.primaryNavy,
                ),
              ),
              TextButton(
                onPressed: () => onNavigate?.call(7),
                child: const Text(
                  'View All Board',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: service.notices.take(2).length,
            itemBuilder: (context, idx) {
              final n = service.notices[idx];
              return Card(
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(color: Colors.grey.shade100, width: 1.5),
                ),
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFFFF7ED),
                    child: Icon(
                      Icons.notification_important,
                      color: AppTheme.accentAmber,
                      size: 20,
                    ),
                  ),
                  title: Text(
                    n.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppTheme.primaryNavy),
                  ),
                  subtitle: Text(
                    n.content,
                    style: const TextStyle(fontSize: 9),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildStatBox(
    BuildContext context, {
    required String title,
    required String value,
    required Color color,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.06),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: color.withOpacity(0.12), width: 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 7,
                      fontWeight: FontWeight.bold,
                      color: color,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Icon(icon, size: 10, color: color),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                value,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.black,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPortalMenuCard({
    required IconData icon,
    required String label,
    required String sub,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade100, width: 1.5),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: color.withOpacity(0.08),
                child: Icon(icon, color: color, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 10.5,
                        color: AppTheme.primaryNavy,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 1),
                    Text(
                      sub,
                      style: TextStyle(
                        fontSize: 8,
                        color: Colors.grey.shade500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
