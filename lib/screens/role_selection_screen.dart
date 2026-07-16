import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/portal_service.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';

class RoleSelectionScreen extends StatefulWidget {
  const RoleSelectionScreen({super.key});

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen> {
  String? _hoveredRole;

  void _selectRole(String roleId) {
    final service = Provider.of<PortalService>(context, listen: false);
    service.setRole(roleId);

    // Direct transition to pre-loaded Login Screen for the selected role
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => LoginScreen(initialRole: roleId),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(1.0, 0.0),
              end: Offset.zero,
            ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutQuint)),
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 500),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 768;

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: Stack(
        children: [
          // Elegant decorative ambient spheres in the background
          Positioned(
            top: -200,
            left: -200,
            child: Container(
              width: 500,
              height: 500,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primaryNavy.withOpacity(0.03),
              ),
            ),
          ),
          Positioned(
            bottom: -150,
            right: -150,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.accentAmber.withOpacity(0.04),
              ),
            ),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
                child: Container(
                  maxWidth: 1000,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // School Small Logo/Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryNavy,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppTheme.accentAmber, width: 1.5),
                            ),
                            child: const Icon(
                              Icons.school_rounded,
                              color: AppTheme.accentAmber,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Sunita International School',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryNavy,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),

                      // Welcome & Directions Headline
                      Text(
                        'Select Your Institutional Role',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: isMobile ? 26 : 36,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.primaryNavy,
                          letterSpacing: -1.0,
                          height: 1.1,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Choose your department portal to authenticate secure transactions and records.',
                        style: GoogleFonts.inter(
                          fontSize: isMobile ? 13 : 15,
                          color: AppTheme.textLight,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 48),

                      // Responsive Grid of Role Cards
                      isMobile
                          ? Column(
                              children: [
                                _buildRoleCard(
                                  id: 'admin',
                                  title: 'Institution Admin',
                                  subtitle: 'Management & Operations',
                                  desc: 'Approve fees, publish official bulletins, monitor class structures and security ledgers.',
                                  icon: Icons.admin_panel_settings_rounded,
                                  cardColor: const Color(0xFF0F2C59),
                                  accentColor: AppTheme.accentAmber,
                                ),
                                const SizedBox(height: 16),
                                _buildRoleCard(
                                  id: 'teacher',
                                  title: 'Academic Educator',
                                  subtitle: 'Teachers & Instructors',
                                  desc: 'Register real-time student attendance, push home study, and review class grades.',
                                  icon: Icons.co_present_rounded,
                                  cardColor: const Color(0xFF1E5F74),
                                  accentColor: const Color(0xFF17B978),
                                ),
                                const SizedBox(height: 16),
                                _buildRoleCard(
                                  id: 'student',
                                  title: 'Enrolled Student',
                                  subtitle: 'Primary & Secondary learners',
                                  desc: 'Review upcoming unit exams, track academic calendar events, and check status.',
                                  icon: Icons.face_retouching_natural_rounded,
                                  cardColor: const Color(0xFF1D2D50),
                                  accentColor: const Color(0xFF13C1C2),
                                ),
                                const SizedBox(height: 16),
                                _buildRoleCard(
                                  id: 'parent',
                                  title: 'Family & Parent',
                                  subtitle: 'Guardians & Beneficiaries',
                                  desc: 'Pay class tuition fees instantly, monitor school events, and check performance.',
                                  icon: Icons.family_restroom_rounded,
                                  cardColor: const Color(0xFF533483),
                                  accentColor: const Color(0xFFFF2E93),
                                ),
                              ],
                            )
                          : GridView.count(
                              crossAxisCount: 2,
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              crossAxisSpacing: 24,
                              mainAxisSpacing: 24,
                              childAspectRatio: 1.45,
                              children: [
                                _buildRoleCard(
                                  id: 'admin',
                                  title: 'Institution Admin',
                                  subtitle: 'Management & Operations',
                                  desc: 'Approve fees, publish official bulletins, monitor class structures and security ledgers.',
                                  icon: Icons.admin_panel_settings_rounded,
                                  cardColor: const Color(0xFF0F2C59),
                                  accentColor: AppTheme.accentAmber,
                                ),
                                _buildRoleCard(
                                  id: 'teacher',
                                  title: 'Academic Educator',
                                  subtitle: 'Teachers & Instructors',
                                  desc: 'Register real-time student attendance, push home study, and review class grades.',
                                  icon: Icons.co_present_rounded,
                                  cardColor: const Color(0xFF1E5F74),
                                  accentColor: const Color(0xFF17B978),
                                ),
                                _buildRoleCard(
                                  id: 'student',
                                  title: 'Enrolled Student',
                                  subtitle: 'Primary & Secondary learners',
                                  desc: 'Review upcoming unit exams, track academic calendar events, and check status.',
                                  icon: Icons.face_retouching_natural_rounded,
                                  cardColor: const Color(0xFF1D2D50),
                                  accentColor: const Color(0xFF13C1C2),
                                ),
                                _buildRoleCard(
                                  id: 'parent',
                                  title: 'Family & Parent',
                                  subtitle: 'Guardians & Beneficiaries',
                                  desc: 'Pay class tuition fees instantly, monitor school events, and check performance.',
                                  icon: Icons.family_restroom_rounded,
                                  cardColor: const Color(0xFF533483),
                                  accentColor: const Color(0xFFFF2E93),
                                ),
                              ],
                            ),

                      const SizedBox(height: 50),
                      Text(
                        'Protected by Sunita Academic Secure Core System',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: Colors.grey.shade500,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleCard({
    required String id,
    required String title,
    required String subtitle,
    required String desc,
    required IconData icon,
    required Color cardColor,
    required Color accentColor,
  }) {
    final isHovered = _hoveredRole == id;

    return MouseRegion(
      onEnter: (_) => setState(() => _hoveredRole = id),
      onExit: (_) => setState(() => _hoveredRole = null),
      child: GestureDetector(
        onTap: () => _selectRole(id),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeInOut,
          decoration: BoxDecoration(
            color: isHovered ? cardColor.withOpacity(0.95) : cardColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isHovered ? accentColor : Colors.white.withOpacity(0.08),
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: isHovered 
                    ? cardColor.withOpacity(0.4) 
                    : Colors.black.withOpacity(0.12),
                blurRadius: isHovered ? 20 : 8,
                offset: isHovered ? const Offset(0, 8) : const Offset(0, 4),
              )
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: Stack(
              children: [
                // Stylized ambient geometric shape inside the card
                Positioned(
                  top: -40,
                  right: -40,
                  child: Container(
                    width: 130,
                    height: 130,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.03),
                    ),
                  ),
                ),
                Positioned(
                  bottom: -60,
                  right: 30,
                  child: Icon(
                    icon,
                    size: 160,
                    color: Colors.white.withOpacity(0.02),
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Icon and Accent indicator
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              icon,
                              color: accentColor,
                              size: 26,
                            ),
                          ),
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: accentColor,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: accentColor.withOpacity(0.6),
                                  blurRadius: 6,
                                  spreadRadius: 2,
                                )
                              ]
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),

                      // Text Branding & Labels
                      Text(
                        subtitle.toUpperCase(),
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.white60,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        title,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 19,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        desc,
                        style: GoogleFonts.inter(
                          fontSize: 11.5,
                          color: Colors.white70,
                          height: 1.45,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
