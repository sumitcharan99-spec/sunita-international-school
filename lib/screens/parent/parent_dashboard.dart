import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/portal_service.dart';
import '../../theme/app_theme.dart';

class ParentDashboard extends StatelessWidget {
  final Function(int)? onNavigate;

  const ParentDashboard({super.key, this.onNavigate});

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final user = service.currentUserProfile;
    final String parentName = user?.name ?? 'Suresh Sharma';
    final String childName = 'Rahul Sharma';
    final String childClass = 'Class 10A';
    final String childRollNo = '24';

    final myUnpaidFees = service.fees.where((f) => f.studentId == 'std_1' && f.status == 'unpaid').toList();
    final homeworkCount = service.homeworks.where((h) => h['classId'] == 'Class 10A').length;
    final unreadCount = service.parentNotifications.where((n) => !n['isRead']).length;

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
                      Icons.family_restroom_rounded,
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
                                  'Namaste, $parentName',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.black,
                                    color: Colors.white,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Parent Portal • Ward: $childName ($childClass)',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppTheme.accentAmber,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (unreadCount > 0)
                            Chip(
                              label: Text(
                                '$unreadCount New Alerts',
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
                        'Welcome to the Sunita Parent Desk. Gain secure insights into your child\'s attendance logs, assigned homework sheets, term evaluation results, and manage administrative leave requests or fee invoices below.',
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
                subText: 'Present: 45 days',
                color: Colors.green,
                icon: Icons.done_all_rounded,
                onTap: () => onNavigate?.call(2),
              ),
              const SizedBox(width: 8),
              _buildStatBox(
                context,
                title: 'HOMEWORK',
                value: '$homeworkCount Tasks',
                subText: 'Pending review',
                color: Colors.orange,
                icon: Icons.assignment_rounded,
                onTap: () => onNavigate?.call(3),
              ),
              const SizedBox(width: 8),
              _buildStatBox(
                context,
                title: 'REPORT CARD',
                value: 'A+ Grade',
                subText: 'Term 1 Final',
                color: Colors.blue,
                icon: Icons.grade_rounded,
                onTap: () => onNavigate?.call(5),
              ),
              const SizedBox(width: 8),
              _buildStatBox(
                context,
                title: 'FEE STATUS',
                value: myUnpaidFees.isEmpty ? 'Settled' : '₹14,500',
                subText: myUnpaidFees.isEmpty ? 'All cleared' : 'Overdue',
                color: myUnpaidFees.isEmpty ? Colors.green : Colors.red,
                icon: Icons.credit_card_rounded,
                onTap: () => onNavigate?.call(6),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Actions grid menu (Bento-inspired card layouts)
          const Text(
            'Secure Parental Desk Portals',
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
                icon: Icons.portrait_rounded,
                label: 'Child Profile',
                sub: 'ID Card & Academic Info',
                color: Colors.indigo,
                onTap: () => onNavigate?.call(1),
              ),
              _buildPortalMenuCard(
                icon: Icons.calendar_month_rounded,
                label: 'Child Attendance',
                sub: 'Daily registry logs',
                color: Colors.green,
                onTap: () => onNavigate?.call(2),
              ),
              _buildPortalMenuCard(
                icon: Icons.assignment_rounded,
                label: 'Homework Sheets',
                sub: 'Daily academic sheets',
                color: Colors.orange,
                onTap: () => onNavigate?.call(3),
              ),
              _buildPortalMenuCard(
                icon: Icons.calendar_today_rounded,
                label: 'Weekly Timetable',
                sub: 'Periods & teachers list',
                color: Colors.purple,
                onTap: () => onNavigate?.call(4),
              ),
              _buildPortalMenuCard(
                icon: Icons.grade_rounded,
                label: 'Exam Results',
                sub: 'Report transcripts card',
                color: Colors.blue,
                onTap: () => onNavigate?.call(5),
              ),
              _buildPortalMenuCard(
                icon: Icons.credit_card_rounded,
                label: 'Fee Details & Pay',
                sub: 'Invoices & Receipts',
                color: Colors.teal,
                onTap: () => onNavigate?.call(6),
              ),
              _buildPortalMenuCard(
                icon: Icons.edit_calendar_rounded,
                label: 'Leave Applications',
                sub: 'Apply leave & history',
                color: Colors.pink,
                onTap: () => onNavigate?.call(7),
              ),
              _buildPortalMenuCard(
                icon: Icons.contact_support_rounded,
                label: 'Contact School',
                sub: 'Inquiries & query forms',
                color: Colors.teal.shade700,
                onTap: () => onNavigate?.call(8),
              ),
              _buildPortalMenuCard(
                icon: Icons.campaign_rounded,
                label: 'Notices & Circulars',
                sub: 'School boards notices',
                color: Colors.redAccent,
                onTap: () => onNavigate?.call(9),
              ),
              _buildPortalMenuCard(
                icon: Icons.photo_library_rounded,
                label: 'Events Gallery',
                sub: 'Memories of school life',
                color: Colors.amber.shade800,
                onTap: () => onNavigate?.call(10),
              ),
              _buildPortalMenuCard(
                icon: Icons.notifications_active_rounded,
                label: 'Alerts & Notifications',
                sub: 'Security push messages',
                color: Colors.deepPurple,
                onTap: () => onNavigate?.call(11),
              ),
              _buildPortalMenuCard(
                icon: Icons.vpn_key_rounded,
                label: 'Account Security',
                sub: 'Modify passwords',
                color: Colors.blueGrey,
                onTap: () => onNavigate?.call(12),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Notices Bulletin Board
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent Notices & Circulars',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: AppTheme.primaryNavy,
                ),
              ),
              TextButton(
                onPressed: () => onNavigate?.call(9),
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
                      Icons.notification_important_rounded,
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
    required String subText,
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
              const SizedBox(height: 2),
              Text(
                subText,
                style: TextStyle(
                  fontSize: 7,
                  color: color.withOpacity(0.8),
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
