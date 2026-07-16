import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/portal_service.dart';
import '../theme/app_theme.dart';
import 'forgot_password_screen.dart';
import 'role_selection_screen.dart';

class LoginScreen extends StatefulWidget {
  final String? initialRole;
  const LoginScreen({super.key, this.initialRole});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _classCtrl = TextEditingController(text: 'Class 10A');
  final _rollCtrl = TextEditingController(text: '24');
  final _phoneCtrl = TextEditingController();

  bool _isSignUp = false;
  late String _selectedRole; // 'admin' | 'teacher' | 'student' | 'parent'
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.initialRole ?? 'student';
    // Prefill default account details based on selected role
    _autoFillForRole(_selectedRole);
  }

  void _autoFillForRole(String role) {
    if (role == 'admin') {
      _emailCtrl.text = 'admin@sunita.com';
      _passwordCtrl.text = 'admin123';
    } else if (role == 'teacher') {
      _emailCtrl.text = 'teacher@sunita.com';
      _passwordCtrl.text = 'teacher123';
    } else {
      _emailCtrl.text = 'student@sunita.com';
      _passwordCtrl.text = 'student123';
    }
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _nameCtrl.dispose();
    _classCtrl.dispose();
    _rollCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  void _submit() async {
    final service = Provider.of<PortalService>(context, listen: false);
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please satisfy all institutional login parameters.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    if (_isSignUp && _nameCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Full Name is required for roster directory enrollment.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    try {
      if (_isSignUp) {
        await service.register(
          email,
          password,
          _nameCtrl.text.trim(),
          _selectedRole,
          classId: _classCtrl.text.trim(),
          rollNo: _rollCtrl.text.trim(),
          phone: _phoneCtrl.text.trim(),
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Account provisioned successfully under role: ${_selectedRole.toUpperCase()}!'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        // Enforce role sync with portal service state on login
        service.setRole(_selectedRole);
        await service.login(email, password);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Session authenticated successfully. Welcome to Sunita Academic!'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(service.errorMessage ?? e.toString()),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  void _fillQuickCredentials(String email, String password, String role) {
    setState(() {
      _emailCtrl.text = email;
      _passwordCtrl.text = password;
      _selectedRole = role;
      _isSignUp = false;
    });
    final service = Provider.of<PortalService>(context, listen: false);
    service.setRole(role);
  }

  @override
  Widget build(BuildContext context) {
    final service = Provider.of<PortalService>(context);
    final isDesktop = MediaQuery.of(context).size.width > 850;

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: Row(
        children: [
          // Elegant decorative left banner for wider screens (desktop/web)
          if (isDesktop)
            Expanded(
              flex: 4,
              child: Container(
                color: AppTheme.primaryNavy,
                padding: const EdgeInsets.all(50),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.accentAmber,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.accentAmber.withOpacity(0.3),
                            blurRadius: 15,
                            spreadRadius: 2,
                          )
                        ],
                      ),
                      child: const Icon(
                        Icons.school_rounded,
                        color: AppTheme.primaryNavy,
                        size: 44,
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text(
                      'Sunita International School\nAcademic Unified Portal',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 36,
                        fontWeight: FontWeight.black,
                        color: Colors.white,
                        height: 1.25,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Authenticate secure administrative sessions, manage student billing ledger entries, register real-time attendance, and publish official bulletins instantly.',
                      style: GoogleFonts.inter(
                        color: Colors.white70,
                        fontSize: 14.5,
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 48),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '🛡️ CRYPTOGRAPHIC MULTI-PORTAL ENVIRONMENT',
                            style: GoogleFonts.spaceGrotesk(
                              color: AppTheme.accentAmber,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                              letterSpacing: 1.0,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Every access request, attendance ledger, and transaction log is authorized securely under Firebase Security Rules and Client SHA Verification.',
                            style: GoogleFonts.inter(
                              color: Colors.white54, 
                              fontSize: 11.5, 
                              height: 1.4
                            ),
                          )
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ),

          // Central Login Input Panel
          Expanded(
            flex: 5,
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 30),
                child: Center(
                  child: Container(
                    maxWidth: 480,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Back to Role Selection Button
                        TextButton.icon(
                          onPressed: () {
                            Navigator.of(context).pushReplacement(
                              MaterialPageRoute(builder: (context) => const RoleSelectionScreen()),
                            );
                          },
                          icon: const Icon(Icons.apps_rounded, size: 16, color: AppTheme.primaryNavy),
                          label: Text(
                            'Change Portal Role',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryNavy,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Branding header
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppTheme.accentAmber,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                Icons.school_rounded,
                                color: AppTheme.primaryNavy,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Sunita Academic',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryNavy,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 28),

                        Text(
                          _isSignUp ? 'Enroll Portal Profile' : 'Access Your Portal',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryNavy,
                            letterSpacing: -0.5,
                          ),
                        ),
                        Text(
                          _isSignUp
                              ? 'Fill core directory parameters to register as ${_selectedRole.toUpperCase()}'
                              : 'Authenticate credentials to access ${_selectedRole.toUpperCase()} workspace',
                          style: GoogleFonts.inter(fontSize: 12.5, color: AppTheme.textLight),
                        ),
                        const SizedBox(height: 24),

                        // Core Form Container Card
                        Card(
                          color: Colors.white,
                          elevation: 1,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: Colors.grey.shade100),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Selected Role Badge Selector
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'SELECTED PORTAL',
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.primaryNavy,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primaryNavy.withOpacity(0.08),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(
                                            _selectedRole == 'admin'
                                                ? Icons.admin_panel_settings_rounded
                                                : _selectedRole == 'teacher'
                                                    ? Icons.co_present_rounded
                                                    : _selectedRole == 'student'
                                                        ? Icons.face_retouching_natural_rounded
                                                        : Icons.family_restroom_rounded,
                                            size: 12,
                                            color: AppTheme.primaryNavy,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            _selectedRole.toUpperCase(),
                                            style: GoogleFonts.spaceGrotesk(
                                              fontSize: 9.5,
                                              fontWeight: FontWeight.bold,
                                              color: AppTheme.primaryNavy,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 24),

                                // Sign-up Fields
                                if (_isSignUp) ...[
                                  TextField(
                                    controller: _nameCtrl,
                                    style: GoogleFonts.inter(fontSize: 14),
                                    decoration: InputDecoration(
                                      labelText: 'Full Name',
                                      prefixIcon: const Icon(Icons.person_outline_rounded, size: 20),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  if (_selectedRole == 'student') ...[
                                    Row(
                                      children: [
                                        Expanded(
                                          child: TextField(
                                            controller: _classCtrl,
                                            style: GoogleFonts.inter(fontSize: 14),
                                            decoration: InputDecoration(
                                              labelText: 'Class/Grade',
                                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: TextField(
                                            controller: _rollCtrl,
                                            style: GoogleFonts.inter(fontSize: 14),
                                            decoration: InputDecoration(
                                              labelText: 'Roll No',
                                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                  ],
                                  if (_selectedRole == 'parent' || _selectedRole == 'teacher') ...[
                                    TextField(
                                      controller: _phoneCtrl,
                                      style: GoogleFonts.inter(fontSize: 14),
                                      decoration: InputDecoration(
                                        labelText: 'Contact Phone Number',
                                        prefixIcon: const Icon(Icons.phone_android_rounded, size: 20),
                                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                      keyboardType: TextInputType.phone,
                                    ),
                                    const SizedBox(height: 16),
                                  ],
                                ],

                                // Institution Email Field
                                TextField(
                                  controller: _emailCtrl,
                                  style: GoogleFonts.inter(fontSize: 14),
                                  decoration: InputDecoration(
                                    labelText: 'Institutional Email Address',
                                    prefixIcon: const Icon(Icons.email_outlined, size: 20),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(color: AppTheme.primaryNavy, width: 1.8),
                                    ),
                                  ),
                                  keyboardType: TextInputType.emailAddress,
                                ),
                                const SizedBox(height: 16),

                                // Secure Password Field
                                TextField(
                                  controller: _passwordCtrl,
                                  obscureText: _obscurePassword,
                                  style: GoogleFonts.inter(fontSize: 14),
                                  decoration: InputDecoration(
                                    labelText: 'Access Password',
                                    prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                        size: 20,
                                      ),
                                      onPressed: () {
                                        setState(() => _obscurePassword = !_obscurePassword);
                                      },
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(color: AppTheme.primaryNavy, width: 1.8),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),

                                // Forgot Password Link
                                if (!_isSignUp)
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: TextButton(
                                      onPressed: () {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (context) => ForgotPasswordScreen(
                                              initialEmail: _emailCtrl.text.trim(),
                                            ),
                                          ),
                                        );
                                      },
                                      child: Text(
                                        'Forgot password?',
                                        style: GoogleFonts.inter(
                                          fontSize: 12.5,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.primaryNavy,
                                        ),
                                      ),
                                    ),
                                  ),

                                const SizedBox(height: 16),

                                // Submit action
                                service.isLoading
                                    ? const Center(
                                        child: Padding(
                                          padding: EdgeInsets.all(8.0),
                                          child: CircularProgressIndicator(color: AppTheme.primaryNavy),
                                        ),
                                      )
                                    : ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppTheme.primaryNavy,
                                          foregroundColor: AppTheme.accentAmber,
                                          minimumSize: const Size.fromHeight(48),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                        ),
                                        onPressed: _submit,
                                        child: Text(
                                          _isSignUp ? 'ENROLL SECURE PROFILE' : 'AUTHENTICATE SESSION',
                                          style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold),
                                        ),
                                      ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Switch registration mode
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _isSignUp ? 'Already have an academic profile?' : "Don't have an account?",
                              style: GoogleFonts.inter(fontSize: 12.5, color: AppTheme.textLight),
                            ),
                            TextButton(
                              onPressed: () {
                                setState(() => _isSignUp = !_isSignUp);
                              },
                              child: Text(
                                _isSignUp ? 'Sign In' : 'Enroll Now',
                                style: GoogleFonts.inter(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryNavy,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Quick Developer Demo Access panel
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.amber.shade200),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.bolt_rounded, color: Colors.amber, size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Developer Sandbox Quick Bypass',
                                    style: GoogleFonts.spaceGrotesk(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12.5,
                                      color: AppTheme.primaryNavy,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Click any credentials card to fast-track active credential binding:',
                                style: GoogleFonts.inter(fontSize: 11, color: Colors.black87),
                              ),
                              const SizedBox(height: 12),
                              _buildQuickCredentialButton(
                                'admin@sunita.com',
                                'admin123',
                                'admin',
                                'Administrator Portal Workspace',
                              ),
                              _buildQuickCredentialButton(
                                'teacher@sunita.com',
                                'teacher123',
                                'teacher',
                                'Educator Panel & Roll Call',
                              ),
                              _buildQuickCredentialButton(
                                'student@sunita.com',
                                'student123',
                                'student',
                                'Student & Parent Overview',
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildQuickCredentialButton(
    String email,
    String password,
    String role,
    String title,
  ) {
    final isCurrent = _selectedRole == role;

    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: AppTheme.primaryNavy,
          elevation: 0,
          side: BorderSide(
            color: isCurrent ? AppTheme.primaryNavy : Colors.grey.shade200,
            width: isCurrent ? 1.5 : 1.0,
          ),
          alignment: Alignment.centerLeft,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          minimumSize: const Size.fromHeight(40),
        ),
        onPressed: () => _fillQuickCredentials(email, password, role),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold, fontSize: 10.5),
                ),
                Text(
                  '$email / $password',
                  style: GoogleFonts.inter(fontSize: 9, color: AppTheme.textLight),
                ),
              ],
            ),
            Icon(
              Icons.arrow_forward_ios_rounded,
              size: 10,
              color: isCurrent ? AppTheme.primaryNavy : Colors.grey,
            ),
          ],
        ),
      ),
    );
  }
}
