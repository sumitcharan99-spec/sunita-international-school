import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/portal_service.dart';
import '../theme/app_theme.dart';

// Admin View Screens
import 'admin/admin_dashboard.dart';
import 'admin/admin_billing.dart';
import 'admin/admin_notices.dart';
import 'admin/admin_students.dart';
import 'admin/admin_teachers.dart';
import 'admin/admin_admissions.dart';
import 'admin/admin_attendance.dart';
import 'admin/admin_timetable.dart';
import 'admin/admin_homework.dart';
import 'admin/admin_results.dart';
import 'admin/admin_gallery.dart';
import 'admin/admin_reports.dart';
import 'admin/admin_settings.dart';

// Teacher View Screens
import 'teacher/teacher_attendance.dart';
import 'teacher/teacher_homework.dart';

// Student / Parent View Screens
import 'student/student_overview.dart';
import 'student/student_ledger.dart';
import 'student/academic_calendar.dart';
import 'student/student_profile.dart';
import 'student/student_attendance.dart';
import 'student/student_homework.dart';
import 'student/student_timetable.dart';
import 'student/student_results.dart';
import 'student/student_notices.dart';
import 'student/student_gallery.dart';
import 'student/student_downloads.dart';

// Shared Screen
import 'shared/notices_bulletin_view.dart';

// Parent View Screens
import 'parent/parent_dashboard.dart';
import 'parent/child_profile.dart';
import 'parent/child_attendance.dart';
import 'parent/parent_homework.dart';
import 'parent/parent_timetable.dart';
import 'parent/parent_results.dart';
import 'parent/parent_fees.dart';
import 'parent/parent_leave.dart';
import 'parent/parent_contact.dart';
import 'parent/parent_notices.dart';
import 'parent/parent_gallery.dart';
import 'parent/parent_notifications.dart';
import 'parent/parent_security.dart';

class MainPortalScreen extends StatefulWidget {
  const MainPortalScreen({super.key});

  @override
  State<MainPortalScreen> createState() => _MainPortalScreenState();
}

class _MainPortalScreenState extends State<MainPortalScreen> {
  int _selectedNavIndex = 0;

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final isDesktop = MediaQuery.of(context).size.width > 800;
    final role = service.currentRole;

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        leading: (!isDesktop || role == 'admin')
            ? Builder(
                builder: (context) => IconButton(
                  icon: const Icon(Icons.menu_rounded, color: Colors.white),
                  onPressed: () => Scaffold.of(context).openDrawer(),
                ),
              )
            : null,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppTheme.accentAmber,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 1.5),
              ),
              child: const Icon(
                Icons.school_rounded,
                color: AppTheme.primaryNavy,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Sunita International',
              style: GoogleFonts.spaceGrotesk(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        actions: [
          // Authenticated User Profile Banner & Log Out
          if (service.currentUserProfile != null) ...[
            Center(
              child: Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      service.currentUserProfile!.name,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      service.currentUserProfile!.role.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.accentAmber,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white, size: 20),
            tooltip: 'Sign Out',
            onPressed: () async {
              await service.logout();
            },
          ),
          const SizedBox(width: 4),
          // Role selector dropdown to simulate portal swaps
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
            margin: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: service.currentRole,
                dropdownColor: AppTheme.primaryNavy,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
                icon: const Icon(
                  Icons.arrow_drop_down,
                  color: AppTheme.accentAmber,
                ),
                items: const [
                  DropdownMenuItem(value: 'admin', child: Text('Admin Portal')),
                  DropdownMenuItem(value: 'teacher', child: Text('Teacher Portal')),
                  DropdownMenuItem(value: 'student', child: Text('Student Portal')),
                  DropdownMenuItem(value: 'parent', child: Text('Parent Portal')),
                ],
                onChanged: (String? val) {
                  if (val != null) {
                    setState(() {
                      service.setRole(val);
                      _selectedNavIndex = 0; // reset tab index on swap
                    });
                  }
                },
              ),
            ),
          ),
        ],
      ),
      drawer: (!isDesktop || role == 'admin') ? _buildDrawer(service) : null,
      body: Row(
        children: [
          if (isDesktop && role != 'admin') _buildSidebar(service),
          Expanded(
            child: _buildCurrentBody(service),
          ),
        ],
      ),
      bottomNavigationBar: (isDesktop || role == 'admin')
          ? null
          : BottomNavigationBar(
              currentIndex: role == 'student'
                  ? (_selectedNavIndex == 0 ? 0 : (_selectedNavIndex == 3 ? 1 : (_selectedNavIndex == 6 ? 2 : (_selectedNavIndex == 9 ? 3 : 0))))
                  : (role == 'parent'
                      ? (_selectedNavIndex == 0 ? 0 : (_selectedNavIndex == 3 ? 1 : (_selectedNavIndex == 6 ? 2 : (_selectedNavIndex == 7 ? 3 : 0))))
                      : (_selectedNavIndex >= _buildNavItems(role).length ? 0 : _selectedNavIndex)),
              selectedItemColor: AppTheme.primaryNavy,
              unselectedItemColor: Colors.slate.shade400,
              backgroundColor: Colors.white,
              showUnselectedLabels: true,
              onTap: (index) {
                setState(() {
                  if (role == 'student') {
                    if (index == 0) _selectedNavIndex = 0;
                    if (index == 1) _selectedNavIndex = 3;
                    if (index == 2) _selectedNavIndex = 6;
                    if (index == 3) _selectedNavIndex = 9;
                  } else if (role == 'parent') {
                    if (index == 0) _selectedNavIndex = 0;
                    if (index == 1) _selectedNavIndex = 3;
                    if (index == 2) _selectedNavIndex = 6;
                    if (index == 3) _selectedNavIndex = 7;
                  } else {
                    _selectedNavIndex = index;
                  }
                });
              },
              items: _buildNavItems(service.currentRole),
            ),
    );
  }

  // Drawers (used as sidebars in admin or when collapsing)
  Widget _buildDrawer(PortalService service) {
    final navItems = _getNavConfig(service.currentRole);

    return Drawer(
      backgroundColor: Colors.white,
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(color: AppTheme.primaryNavy),
            currentAccountPicture: CircleAvatar(
              backgroundColor: AppTheme.accentAmber,
              child: const Icon(Icons.school, color: AppTheme.primaryNavy, size: 32),
            ),
            accountName: Text(
              service.currentUserProfile?.name ?? 'Sunita Faculty Admin',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
            ),
            accountEmail: Text(
              service.currentUserProfile?.email ?? 'admin@sunita.com',
              style: const TextStyle(color: AppTheme.accentAmber, fontSize: 11),
            ),
          ),
          Text(
            'CAMPUS WORKSPACE',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade500,
              letterSpacing: 1.2,
            ),
          ),
          const Divider(),
          Expanded(
            child: ListView.builder(
              itemCount: navItems.length,
              itemBuilder: (context, index) {
                final item = navItems[index];
                final isSelected = _selectedNavIndex == index;

                return ListTile(
                  dense: true,
                  leading: Icon(
                    item.icon,
                    color: isSelected ? AppTheme.primaryNavy : Colors.grey.shade500,
                  ),
                  title: Text(
                    item.label,
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? AppTheme.primaryNavy : Colors.grey.shade700,
                    ),
                  ),
                  selected: isSelected,
                  selectedTileColor: AppTheme.primaryNavy.withOpacity(0.05),
                  onTap: () {
                    Navigator.pop(context); // close drawer
                    setState(() {
                      _selectedNavIndex = index;
                    });
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Text(
              'Sunita School System v1.0.0',
              style: TextStyle(fontSize: 9, color: Colors.grey.shade400),
            ),
          )
        ],
      ),
    );
  }

  // Responsive Sidebar Navigation for Web and Desktop screens
  Widget _buildSidebar(PortalService service) {
    final navItems = _getNavConfig(service.currentRole);

    return Container(
      width: 250,
      color: Colors.white,
      border: Border(right: BorderSide(color: Colors.grey.shade200)),
      child: Column(
        children: [
          const SizedBox(height: 16),
          Text(
            'NAVIGATION PANEL',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade500,
              letterSpacing: 1.2,
            ),
          ),
          const Divider(),
          Expanded(
            child: ListView.builder(
              itemCount: navItems.length,
              itemBuilder: (context, index) {
                final item = navItems[index];
                final isSelected = _selectedNavIndex == index;

                return ListTile(
                  leading: Icon(
                    item.icon,
                    color: isSelected ? AppTheme.primaryNavy : Colors.grey.shade500,
                  ),
                  title: Text(
                    item.label,
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? AppTheme.primaryNavy : Colors.grey.shade700,
                    ),
                  ),
                  selected: isSelected,
                  selectedTileColor: AppTheme.primaryNavy.withOpacity(0.05),
                  onTap: () {
                    setState(() {
                      _selectedNavIndex = index;
                    });
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Sunita School System v1.0.0',
              style: TextStyle(fontSize: 10, color: Colors.grey.shade400),
            ),
          )
        ],
      ),
    );
  }

  // Get active navigation items configurations
  List<_NavConfigItem> _getNavConfig(String role) {
    if (role == 'admin') {
      return [
        _NavConfigItem(icon: Icons.dashboard_rounded, label: 'Dashboard'),
        _NavConfigItem(icon: Icons.people_rounded, label: 'Students'),
        _NavConfigItem(icon: Icons.badge_outlined, label: 'Teachers'),
        _NavConfigItem(icon: Icons.edit_note_rounded, label: 'Admissions'),
        _NavConfigItem(icon: Icons.credit_card_rounded, label: 'Fees'),
        _NavConfigItem(icon: Icons.done_all_rounded, label: 'Attendance'),
        _NavConfigItem(icon: Icons.calendar_today_rounded, label: 'Timetable'),
        _NavConfigItem(icon: Icons.assignment_rounded, label: 'Homework'),
        _NavConfigItem(icon: Icons.grade_rounded, label: 'Results'),
        _NavConfigItem(icon: Icons.campaign_rounded, label: 'Notices'),
        _NavConfigItem(icon: Icons.photo_library_rounded, label: 'Gallery'),
        _NavConfigItem(icon: Icons.analytics_rounded, label: 'Reports'),
        _NavConfigItem(icon: Icons.settings_rounded, label: 'Settings'),
      ];
    } else if (role == 'teacher') {
      return [
        _NavConfigItem(icon: Icons.done_all, label: 'Attendance'),
        _NavConfigItem(icon: Icons.assignment, label: 'Homework'),
        _NavConfigItem(icon: Icons.campaign, label: 'Bulletins'),
      ];
    } else if (role == 'parent') {
      return [
        _NavConfigItem(icon: Icons.grid_view_rounded, label: 'Dashboard'),
        _NavConfigItem(icon: Icons.portrait_rounded, label: 'Child Profile'),
        _NavConfigItem(icon: Icons.calendar_month_rounded, label: 'Child Attendance'),
        _NavConfigItem(icon: Icons.assignment_rounded, label: 'Homework Sheets'),
        _NavConfigItem(icon: Icons.calendar_today_rounded, label: 'Weekly Timetable'),
        _NavConfigItem(icon: Icons.grade_rounded, label: 'Exam Results'),
        _NavConfigItem(icon: Icons.credit_card_rounded, label: 'Fee Details & Pay'),
        _NavConfigItem(icon: Icons.edit_calendar_rounded, label: 'Leave Applications'),
        _NavConfigItem(icon: Icons.contact_support_rounded, label: 'Contact School'),
        _NavConfigItem(icon: Icons.campaign_rounded, label: 'Notices & Circulars'),
        _NavConfigItem(icon: Icons.photo_library_rounded, label: 'Events Gallery'),
        _NavConfigItem(icon: Icons.notifications_active_rounded, label: 'Alerts & Notifications'),
        _NavConfigItem(icon: Icons.vpn_key_rounded, label: 'Account Security'),
      ];
    } else {
      return [
        _NavConfigItem(icon: Icons.grid_view_rounded, label: 'Dashboard'),
        _NavConfigItem(icon: Icons.account_circle_rounded, label: 'Student Profile'),
        _NavConfigItem(icon: Icons.done_all_rounded, label: 'Attendance'),
        _NavConfigItem(icon: Icons.assignment_rounded, label: 'Homework'),
        _NavConfigItem(icon: Icons.calendar_today_rounded, label: 'Timetable'),
        _NavConfigItem(icon: Icons.grade_rounded, label: 'Results'),
        _NavConfigItem(icon: Icons.credit_card_rounded, label: 'Fee Status'),
        _NavConfigItem(icon: Icons.campaign_rounded, label: 'Notices'),
        _NavConfigItem(icon: Icons.photo_library_rounded, label: 'Gallery'),
        _NavConfigItem(icon: Icons.event_available_rounded, label: 'Holiday Calendar'),
        _NavConfigItem(icon: Icons.download_rounded, label: 'Downloads'),
      ];
    }
  }

  // Generate navbar tabs based on current simulated portal state
  List<BottomNavigationBarItem> _buildNavItems(String role) {
    if (role == 'student') {
      return const [
        BottomNavigationBarItem(icon: Icon(Icons.grid_view_rounded), label: 'Dashboard'),
        BottomNavigationBarItem(icon: Icon(Icons.assignment_rounded), label: 'Homework'),
        BottomNavigationBarItem(icon: Icon(Icons.credit_card_rounded), label: 'Fees'),
        BottomNavigationBarItem(icon: Icon(Icons.event_available_rounded), label: 'Calendar'),
      ];
    } else if (role == 'parent') {
      return const [
        BottomNavigationBarItem(icon: Icon(Icons.grid_view_rounded), label: 'Dashboard'),
        BottomNavigationBarItem(icon: Icon(Icons.assignment_rounded), label: 'Homework'),
        BottomNavigationBarItem(icon: Icon(Icons.credit_card_rounded), label: 'Fees'),
        BottomNavigationBarItem(icon: Icon(Icons.edit_calendar_rounded), label: 'Leave'),
      ];
    }
    final configs = _getNavConfig(role);
    return configs
        .map((c) => BottomNavigationBarItem(icon: Icon(c.icon), label: c.label))
        .toList();
  }

  Widget _buildCurrentBody(PortalService service) {
    final role = service.currentRole;
    if (role == 'admin') {
      switch (_selectedNavIndex) {
        case 0:
          return AdminDashboard(onNavigate: (index) {
            setState(() {
              _selectedNavIndex = index;
            });
          });
        case 1:
          return const AdminStudents();
        case 2:
          return const AdminTeachers();
        case 3:
          return const AdminAdmissions();
        case 4:
          return const AdminBilling();
        case 5:
          return const AdminAttendance();
        case 6:
          return const AdminTimetable();
        case 7:
          return const AdminHomework();
        case 8:
          return const AdminResults();
        case 9:
          return const AdminNotices();
        case 10:
          return const AdminGallery();
        case 11:
          return const AdminReports();
        case 12:
          return const AdminSettings();
        default:
          return AdminDashboard(onNavigate: (index) {
            setState(() {
              _selectedNavIndex = index;
            });
          });
      }
    } else if (role == 'teacher') {
      switch (_selectedNavIndex) {
        case 0:
          return const TeacherAttendance();
        case 1:
          return const TeacherHomework();
        case 2:
          return const NoticesBulletinView();
        default:
          return const TeacherAttendance();
      }
    } else if (role == 'parent') {
      switch (_selectedNavIndex) {
        case 0:
          return ParentDashboard(onNavigate: (index) {
            setState(() {
              _selectedNavIndex = index;
            });
          });
        case 1:
          return const ChildProfile();
        case 2:
          return const ChildAttendance();
        case 3:
          return const ParentHomework();
        case 4:
          return const ParentTimetable();
        case 5:
          return const ParentResults();
        case 6:
          return const ParentFees();
        case 7:
          return const ParentLeave();
        case 8:
          return const ParentContact();
        case 9:
          return const ParentNotices();
        case 10:
          return const ParentGallery();
        case 11:
          return const ParentNotifications();
        case 12:
          return const ParentSecurity();
        default:
          return ParentDashboard(onNavigate: (index) {
            setState(() {
              _selectedNavIndex = index;
            });
          });
      }
    } else {
      switch (_selectedNavIndex) {
        case 0:
          return StudentOverview(onNavigate: (index) {
            setState(() {
              _selectedNavIndex = index;
            });
          });
        case 1:
          return const StudentProfile();
        case 2:
          return const StudentAttendance();
        case 3:
          return const StudentHomework();
        case 4:
          return const StudentTimetable();
        case 5:
          return const StudentResults();
        case 6:
          return const StudentLedger();
        case 7:
          return const StudentNotices();
        case 8:
          return const StudentGallery();
        case 9:
          return const AcademicCalendar();
        case 10:
          return const StudentDownloads();
        default:
          return StudentOverview(onNavigate: (index) {
            setState(() {
              _selectedNavIndex = index;
            });
          });
      }
    }
  }
}

class _NavConfigItem {
  final IconData icon;
  final String label;

  _NavConfigItem({required this.icon, required this.label});
}
